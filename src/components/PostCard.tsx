const PostCard = ({
  image,
  title,
  price,
  badge,
}: {
  image: string;
  title: string;
  price: string;
  badge?: string;
}) => (
  <div className="card bg-base-100 shadow-md">
    <figure>
      <img src={image} alt={title} className="h-40 w-full object-cover" />
    </figure>
    <div className="card-body p-4">
      <h3 className="card-title text-sm">{title}</h3>
      <p className="text-sm">{price}</p>
      {badge && <div className="badge badge-success mt-2">{badge}</div>}
    </div>
  </div>
);

export default PostCard;
