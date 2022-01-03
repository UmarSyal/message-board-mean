import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  postForm: FormGroup;
  loading: boolean = false;
  editMode: boolean = false;
  postToEditId: string;
  postToEdit: Post;
  imagePreview: string;

  constructor(private postsService: PostsService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.postForm = new FormGroup({
      'title': new FormControl(
        null,
        { validators: [Validators.required, Validators.minLength(3)] }
      ),
      'content': new FormControl(
        null,
        { validators: [Validators.required] }
      ),
      'image': new FormControl(
        null,
        { validators: [Validators.required], asyncValidators: [mimeType] }
      )
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      if (params.has('id')) {
        this.loading = true;
        this.editMode = true;
        this.postToEditId = params.get('id');
        this.postsService.getPost(this.postToEditId)
          .subscribe((result: { message: string, post: any }) => {
            this.postToEdit = {
              id: result.post._id,
              title: result.post.title,
              content: result.post.content,
              imagePath: result.post.imagePath
            };
            this.postForm.setValue({
              'title': this.postToEdit.title,
              'content': this.postToEdit.content,
              'image': this.postToEdit.imagePath
            });
            this.imagePreview = this.postToEdit.imagePath;
            this.loading = false;
          });
      } else {
        this.editMode = false;
        this.postToEditId = null;
        this.postToEdit = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postForm.patchValue({ 'image': file });
    this.postForm.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.postForm.invalid) {
      return;
    }
    this.loading = true;
    if (this.editMode) {
      this.postsService.updatePost(
        this.postToEditId,
        this.postForm.value.title,
        this.postForm.value.content,
        this.postForm.value.image
      );
    } else {
      this.postsService.addNewPost(
        this.postForm.value.title,
        this.postForm.value.content,
        this.postForm.value.image
      );
    }
  }
}
