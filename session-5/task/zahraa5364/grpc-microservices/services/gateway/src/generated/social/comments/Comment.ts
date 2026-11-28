// Original file: ../../proto/social/comments/comments.proto


export interface Comment {
  'id'?: (number);
  'postId'?: (number);
  'authorId'?: (number);
  'content'?: (string);
  'createdAt'?: (string);
}

export interface Comment__Output {
  'id': (number);
  'postId': (number);
  'authorId': (number);
  'content': (string);
  'createdAt': (string);
}
