import BasePostCard from "./BasePostCard";
import ImagePostCard from "./ImagePostCard";
import LinkPostCard from "./LinkPostCard";
import TextPostCard from "./TextPostCard";

export default function PostCard({ post }) {
  const ConcretePostCard = (() => {
    switch(post.type) {
      case "text": return TextPostCard;
      case "image": return ImagePostCard;
      case "link": return LinkPostCard;
      // no default
    }
  })()

  return (
    <BasePostCard post={post}>
      <ConcretePostCard post={post}/>
    </BasePostCard>
  )
}
