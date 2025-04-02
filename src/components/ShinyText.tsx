import './ShinyText.css';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  className?: string;
}

const ShinyText = ({ text, disabled = false, className = '' }: ShinyTextProps) => {
  return (
    <div
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      data-text={text}
    >
      {text}
    </div>
  );
};

export default ShinyText; 