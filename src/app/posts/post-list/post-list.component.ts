import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  private postsSub: Subscription;
  private authStatusSub: Subscription;
  userIsAuthenticated: boolean = false;
  posts: Post[] = [];
  loading: boolean = false;
  totalPosts = 10;
  pageSize = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  constructor(
    private postsService: PostsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.postsService.getPosts(this.pageSize, this.currentPage);
    this.postsSub = this.postsService.getPostsUpdateListener()
      .subscribe((postsData: { posts: Post[], totalPosts: number }) => {
        this.posts = postsData.posts;
        this.totalPosts = postsData.totalPosts;
        this.loading = false;
      });

    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      }
    );
  }

  onDelete(id: string) {
    this.loading = true;
    this.postsService.deletePost(id)
      .subscribe((result) => {
        this.postsService.getPosts(this.pageSize, this.currentPage);
      });
  }

  onPageChanged(pageData: PageEvent) {
    this.loading = true;
    this.pageSize = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.postsService.getPosts(this.pageSize, this.currentPage);
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
