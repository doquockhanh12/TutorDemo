export default function Button({ variant = 'primary', size = 'md', className = '', children, type = 'button', ...props }) {
  return <button type={type} className={`button button--${variant} button--${size} ${className}`} {...props}>{children}</button>;
}
