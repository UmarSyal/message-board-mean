import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts_api_url_prefix = environment.api_url_prefix + 'posts/';

  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; totalPosts: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(pageSize: number, currentPage: number) {
    const queryParams = `?pageSize=${pageSize}&currentPage=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; totalPosts: number }>(
        this.posts_api_url_prefix + queryParams
      )
      .pipe(
        map((results) => {
          return {
            posts: results.posts.map((post) => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
                creator: post.creator,
              };
            }),
            totalPosts: results.totalPosts,
          };
        })
      )
      .subscribe((postsData) => {
        this.posts = postsData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          totalPosts: postsData.totalPosts,
        });
      });
  }

  getPost(id: string) {
    return this.http.get<{ message: string; post: any }>(
      this.posts_api_url_prefix + id
    );
  }

  addNewPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string }>(this.posts_api_url_prefix, postData)
      .subscribe((data) => {
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: string | File) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
      };
    }
    this.http
      .put<{ message: string }>(this.posts_api_url_prefix + id, postData)
      .subscribe((data) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(id: string) {
    return this.http.delete(this.posts_api_url_prefix + id);
  }

  getPostsUpdateListener() {
    return this.postsUpdated.asObservable();
  }
}
