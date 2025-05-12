import "../styles/SectionStyles.css";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="section-container">
    <h2 className="section-title">{title}</h2>
    {children}
  </div>
);

export default Section;
