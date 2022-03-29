import CollapsingText from "../CollapsingText"

export default function TextPostCard({ post }) {
  return (
    <CollapsingText 
    text={
      post.text
    }
    />
  )
}