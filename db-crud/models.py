from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class Post(BaseModel):
    title: str = Field(...)
    subreddit: str = Field(...)
    author: str = Field(...)
    created_utc: datetime = Field(...)
    domain: str = Field(...)
    url: str = Field(...)
    num_comments: int = Field(...)
    selftext: Optional[str] = None
    score: int = Field(...)
    url_content: str = Field(...)

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "post_id": "066de609-b04a-4b30-b46c-32537c7f1f6e",
                "title": "...",
                "subreddit": "news",
                "author": "...",
                "created_utc": "2022-05-01 22:40:41",
                "domain": "nytimes.com",
                "url": "...",
                "num_comments": "10",
                "selftext": "...",
                "score": "10",
                "url_content": "..."
            }
        }


def ResponseModel(data, message):
    return {
        "data": [data],
        "code": 200,
        "message": message,
    }


def ErrorResponseModel(error, code, message):
    return {"error": error, "code": code, "message": message}
