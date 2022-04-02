/**
 * The abstract component which chooses the correct components
 * to use to render a post based on its type
 */

import BasePostCard from "./BasePostCard";
import ImagePostCard from "./ImagePostCard";
import LinkPostCard from "./LinkPostCard";
import TextPostCard from "./TextPostCard";

/**
 * An abstract PostCard component which creates the correct
 * post based on its type
 * @param {*} post
 * @returns 
 */
export default function PostCard({ post, showPact=false }) {
  const ConcretePostCard = (() => {
    switch(post.type) {
      case "text": return TextPostCard;
      case "image": return ImagePostCard;
      case "link": return LinkPostCard;
      // no default
    }
  })()

  return (
      <BasePostCard post={post} showPact={showPact}>
        <ConcretePostCard post={post}/>
      </BasePostCard>
  )
}
