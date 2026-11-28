// Original file: ../../proto/social/comments/comments.proto


export interface ImportCommentsResponse {
  'imported'?: (number);
  'failed'?: (number);
  'errors'?: (string)[];
}

export interface ImportCommentsResponse__Output {
  'imported': (number);
  'failed': (number);
  'errors': (string)[];
}
