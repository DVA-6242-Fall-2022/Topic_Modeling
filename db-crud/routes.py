import json
from fastapi import APIRouter, Body, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from typing import List

from models import Post

router = APIRouter()


def student_helper(student) -> dict:
    return {
        "id": str(student["_id"]),
        "fullname": student["fullname"],
        "email": student["email"],
        "course_of_study": student["course_of_study"],
        "year": student["year"],
        "GPA": student["gpa"],
    }


@router.post("/", response_description="Create a new Post entry", status_code=status.HTTP_201_CREATED, response_model=Post)
def create_post(request: Request, post: Post = Body(...)):
    post = jsonable_encoder(post)
    new_post = request.app.database["posts"].insert_one(post)
    created_post = request.app.database["posts"].find_one(
        {"_id": new_post.inserted_id})

    return created_post


@router.get("/", response_description="List all posts", response_model=List[Post])
def list_posts(request: Request):
    posts = list(request.app.database["posts"].find(limit=100))
    return posts


@router.get("/{post_id}", response_description="Get a single post by id", response_model=Post)
def find_post(post_id: str, request: Request):
    if (post := request.app.database["posts"].find_one({"post_id": post_id})) is not None:
        return post
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Post with ID {post_id} not found")


@router.delete("{post_id}", response_description="Delete a post")
def delete_post(post_id: str, request: Request, response: Response):
    delete_result = request.app.database["posts"].delete_one(
        {"post_id": post_id})

    if delete_result.delete_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Post with ID {post_id} not found")
