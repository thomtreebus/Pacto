export default function LinkPostCard({ post }) {
  return (
    <a href={post.link}>{post.link}</a>
  )
}