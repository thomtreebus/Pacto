import ImagePostCard from "./ImagePostCard";
import LinkPostCard from "./LinkPostCard";
import TextPostCard from "./TextPostCard";

export default function PostCard({ post }) {
  concretePostCard = () => {
    switch(post.type) {
      case "text": return TextPostCard;
      case "image": return ImagePostCard;
      case "link": return LinkPostCard;
      default: return;
    }
  }

  return (
    <div className="post">
      <concretePostCard post={post} />
    </div>
  )
}
