
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from crawl4ai import AsyncWebCrawler
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


class GoogleLogin(SocialLoginView):
    authentication_classes = []
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.OAUTH_CALLBACK_URL
    client_class = OAuth2Client

@api_view(['POST'])
async def scrape_url(request):
    url = request.data.get('url')
    if not url:
        return Response(
            {'error': 'URL is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url=url)
            return Response({'content': result.markdown})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
