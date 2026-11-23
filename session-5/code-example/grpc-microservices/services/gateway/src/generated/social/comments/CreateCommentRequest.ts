// Original file: ../../proto/social/comments/comments.proto


export interface CreateCommentRequest {
  'postId'?: (number);
  'authorId'?: (number);
  'content'?: (string);
}

export interface CreateCommentRequest__Output {
  'postId': (number);
  'authorId': (number);
  'content': (string);
}
