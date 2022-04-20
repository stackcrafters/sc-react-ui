// /**
//  * @module
//  *
//  * Provides the main method used to convert markdown to html.
//  */
//
// import { unified } from 'unified';
// import remarkParse from 'remark-parse';
// import remarkGfm from 'remark-gfm';
// import remarkHtml from 'remark-html';
//
// const markdownToHtmlProcessor = unified().use(remarkParse).use(remarkGfm).use(remarkHtml);
//
// /**
//  * Converts the provided markdown to HTML.
//  */
// export function markdownToHtml(markdown: string, sanitizer?: (html: string) => string): string {
//   return markdownToHtmlProcessor.processSync(markdown).value.toString();
// }
