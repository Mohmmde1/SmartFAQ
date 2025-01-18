import re
from typing import List, Tuple

import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from transformers import pipeline

from .models import QuestionAnswer


class FAQGenerator:
    def __init__(self, model_name: str = "deepset/roberta-base-squad2"):
        self.nlp = spacy.load("en_core_web_sm")
        self.qa_models = [
            pipeline('question-answering', model="deepset/roberta-base-squad2"),
            pipeline('question-answering', model="distilbert-base-uncased-distilled-squad")
        ]
        self.templates = [
            "What is {}?",
            "Why is {} important?",
            "How does {} work?",
            "What are the benefits of {}?",
            "Can you explain {}?",
            "What are the key aspects of {}?"
        ]

    def preprocess_text(self, text: str) -> Tuple[List[str], List[str]]:
        text = re.sub(r'\s+', ' ', text).strip()
        doc = self.nlp(text)

        sentences = [sent.text.strip() for sent in doc.sents]
        important_phrases = {
            ent.text for ent in doc.ents
            if ent.label_ in ['ORG', 'PERSON', 'GPE', 'PRODUCT', 'EVENT']
        }
        important_phrases.update(
            chunk.text for chunk in doc.noun_chunks
            if chunk.text not in important_phrases
        )

        return sentences, list(important_phrases)

    def rank_phrases(self, text: str, phrases: List[str]) -> List[str]:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([text])
        feature_names = vectorizer.get_feature_names_out()

        phrase_scores = {
            phrase: sum(
                tfidf_matrix[0, feature_names.tolist().index(word)]
                for word in phrase.split()
                if word in feature_names
            )
            for phrase in phrases
        }

        return [
            phrase for phrase, _ in
            sorted(phrase_scores.items(), key=lambda x: x[1], reverse=True)
        ]

    def generate_questions(self, phrases: List[str], num_questions: int) -> List[str]:
        return [
            self.templates[i % len(self.templates)].format(phrase)
            for i, phrase in enumerate(phrases[:num_questions])
        ]

    def generate_answers(self, questions: List[str], context: str) -> List[dict]:
        answers = []
        for question in questions:
            best_answer = None
            best_score = -1

            for model in self.qa_models:
                try:
                    result = model({'question': question, 'context': context})
                    if result['score'] > best_score:
                        best_answer = result['answer']
                        best_score = result['score']
                except Exception:
                    continue

            qa = QuestionAnswer.objects.create(
                question=question,
                answer=best_answer if best_answer else "Answer not available."
            )
            answers.append(qa)

        return answers
