from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from openhands.core.logger import openhands_logger as logger
from openhands.server.auth import get_keycloak_token, get_user_id
from openhands.server.data_models.gh_types import GitHubRepository, GitHubUser
from openhands.server.services.github_service import GitHubService
from openhands.server.shared import server_config
from openhands.server.types import GhAuthenticationError, GHUnknownException
from openhands.utils.import_utils import get_impl

app = APIRouter(prefix='/api/github')

GithubServiceImpl = get_impl(GitHubService, server_config.github_service_class)


@app.get('/repositories')
async def get_github_repositories(
    page: int = 1,
    per_page: int = 10,
    sort: str = 'pushed',
    installation_id: int | None = None,
    github_user_id: str | None = Depends(get_user_id),
    keycloak_token: str | None = Depends(get_keycloak_token),
):
    client = (
        GithubServiceImpl(keycloak_token)
        if keycloak_token
        else GithubServiceImpl(github_user_id)
    )
    try:
        repos: list[GitHubRepository] = await client.get_repositories(
            page, per_page, sort, installation_id
        )
        return repos

    except GhAuthenticationError as e:
        logger.error("Couldn't search GitHub repositories")
        logger.error(e)
        return JSONResponse(
            content=str(e),
            status_code=401,
        )

    except GHUnknownException as e:
        logger.error("Couldn't search GitHub repositories")
        logger.error(e)
        return JSONResponse(
            content=str(e),
            status_code=500,
        )
    except Exception as e:
        logger.error("Couldn't get GitHub repositories")
        logger.error(e)
        raise


@app.get('/user')
async def get_github_user(
    github_user_id: str | None = Depends(get_user_id),
    keycloak_token: str | None = Depends(get_keycloak_token),
):
    client = (
        GithubServiceImpl(keycloak_token)
        if keycloak_token
        else GithubServiceImpl(github_user_id)
    )
    try:
        user: GitHubUser = await client.get_user()
        return user

    except GhAuthenticationError as e:
        logger.error("Couldn't get GitHub user")
        logger.error(e)
        return JSONResponse(
            content=str(e),
            status_code=401,
        )

    except GHUnknownException as e:
        logger.error("Couldn't get GitHub user")
        logger.error(e)
        return JSONResponse(
            content=str(e),
            status_code=500,
        )
    except Exception as e:
        logger.error("Couldn't get GitHub repositories")
        logger.error(e)
        raise


@app.get('/installations')
async def get_github_installation_ids(
    github_user_id: str | None = Depends(get_user_id),
    keycloak_token: str | None = Depends(get_keycloak_token),
):
    client = (
        GithubServiceImpl(keycloak_token)
        if keycloak_token
        else GithubServiceImpl(github_user_id)
    )
    try:
        installations_ids: list[int] = await client.get_installation_ids()
        return installations_ids

    except GhAuthenticationError as e:
        logger.error("Couldn't get GitHub installations")
        logger.error(e)
        return JSONResponse(
            content=str(e),
            status_code=401,
        )

    except GHUnknownException as e:
        logger.error("Couldn't get GitHub installations")
        logger.error(e)
        return JSONResponse(
            content=str(e),
            status_code=500,
        )
    except Exception as e:
        logger.error("Couldn't get GitHub repositories")
        logger.error(e)
        raise


@app.get('/search/repositories')
async def search_github_repositories(
    query: str,
    per_page: int = 5,
    sort: str = 'stars',
    order: str = 'desc',
    github_user_id: str | None = Depends(get_user_id),
    keycloak_token: str | None = Depends(get_keycloak_token),
):
    client = (
        GithubServiceImpl(keycloak_token)
        if keycloak_token
        else GithubServiceImpl(github_user_id)
    )
    try:
        repos: list[GitHubRepository] = await client.search_repositories(
            query, per_page, sort, order
        )
        return repos

    except GhAuthenticationError as e:
        logger.error("Couldn't search GitHub repositories")
        logger.error(e)
        return JSONResponse(
            content=str(e),
            status_code=401,
        )

    except GHUnknownException as e:
        logger.error("Couldn't search GitHub repositories")
        logger.error(e)
        return JSONResponse(
            content=str(e),
            status_code=500,
        )
    except Exception as e:
        logger.error("Couldn't get GitHub repositories")
        logger.error(e)
        raise
