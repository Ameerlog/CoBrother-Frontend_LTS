import { Link } from 'react-router-dom';

/**
 * Professional Button Component
 * Supports multiple variants with consistent styling across the application
 * 
 * @param {string} variant - 'professional' | 'professional-sm' | 'professional-lg' | 'primary' | 'secondary' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg' (only for non-professional variants)
 * @param {string} to - If provided, renders as Link component
 * @param {string} href - If provided, renders as anchor tag
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional classes
 * @param {ReactNode} children - Button content
 * @param {string} type - Button type (button, submit, reset)
 */
export default function Button({
  variant = 'professional',
  size = 'md',
  to,
  href,
  onClick,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  // Professional button variants (purple border with hover fill)
  const professionalVariants = {
    'professional': 'btn-professional',
    'professional-sm': 'btn-professional-sm',
    'professional-lg': 'btn-professional-lg',
  };

  // Legacy button variants
  const legacyVariants = {
    'primary': 'px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg',
    'secondary': 'px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all',
    'danger': 'px-6 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg',
    'ghost': 'px-6 py-2.5 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all',
  };

  // Size variants for legacy buttons
  const sizeVariants = {
    'sm': 'px-4 py-2 text-sm',
    'md': 'px-6 py-2.5 text-base',
    'lg': 'px-8 py-3 text-lg',
  };

  // Determine the button classes
  let buttonClasses = '';
  
  if (professionalVariants[variant]) {
    buttonClasses = professionalVariants[variant];
  } else if (legacyVariants[variant]) {
    buttonClasses = legacyVariants[variant];
    // Apply size variant only for legacy buttons
    if (variant !== 'professional' && variant !== 'professional-sm' && variant !== 'professional-lg') {
      buttonClasses = buttonClasses.replace(/px-\d+ py-[\d.]+/, sizeVariants[size]);
    }
  } else {
    // Default to professional
    buttonClasses = 'btn-professional';
  }

  // Add disabled styles
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : '';

  // Combine all classes
  const finalClasses = `${buttonClasses} ${disabledClasses} ${className}`.trim();

  // Common props
  const commonProps = {
    className: finalClasses,
    onClick: disabled ? undefined : onClick,
    disabled,
    ...props,
  };

  // Render as Link if 'to' prop is provided
  if (to) {
    return (
      <Link to={to} {...commonProps}>
        {children}
      </Link>
    );
  }

  // Render as anchor if 'href' prop is provided
  if (href) {
    return (
      <a href={href} {...commonProps}>
        {children}
      </a>
    );
  }

  // Render as button
  return (
    <button type={type} {...commonProps}>
      {children}
    </button>
  );
}

// Export named variants for convenience
export const ProfessionalButton = (props) => <Button variant="professional" {...props} />;
export const ProfessionalButtonSm = (props) => <Button variant="professional-sm" {...props} />;
export const ProfessionalButtonLg = (props) => <Button variant="professional-lg" {...props} />;
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
