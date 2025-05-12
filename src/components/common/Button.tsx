import React from 'react';
import { Link } from 'react-router-dom';

// 플랫폼 독립적인 타입 정의
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  to?: string;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  testId?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// 스타일 정의 분리 - 플랫폼 독립적인 스타일 로직
export const getButtonStyles = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  hasIcon = false,
  iconPosition = 'left'
): string => {
  // 기본 버튼 스타일
  let classes = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg focus:outline-none transition-colors';

  // 크기 스타일
  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-2.5',
    xl: 'text-xl px-6 py-3',
  };
  classes += ` ${sizeClasses[size]}`;

  // 가로 너비
  if (fullWidth) {
    classes += ' w-full';
  }

  // 변형 스타일
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
    text: 'text-primary-600 hover:bg-gray-100 dark:text-primary-400 dark:hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };
  classes += ` ${variantClasses[variant]}`;

  // 비활성화 상태
  if (disabled || isLoading) {
    classes += ' opacity-60 cursor-not-allowed';
  }

  return classes;
};

// 웹 환경에서의 버튼 구현
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  to,
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  type = 'button',
  className = '',
  testId,
  icon,
  iconPosition = 'left',
}) => {
  const hasIcon = !!icon;
  const buttonClasses = `${getButtonStyles(variant, size, fullWidth, disabled, isLoading, hasIcon, iconPosition)} ${className}`;

  const content = (
    <>
      {isLoading && (
        <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
      )}
      {!isLoading && icon && iconPosition === 'left' && icon}
      {children}
      {!isLoading && icon && iconPosition === 'right' && icon}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        data-testid={testId}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
        style={disabled ? { pointerEvents: 'none' } : undefined}
      >
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={buttonClasses}
        data-testid={testId}
        onClick={disabled ? (e) => e.preventDefault() : undefined}
        target="_blank"
        rel="noopener noreferrer"
        style={disabled ? { pointerEvents: 'none' } : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      data-testid={testId}
    >
      {content}
    </button>
  );
};

export default Button;

export function IconButton({
  icon,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: Omit<ButtonProps, 'children'> & { icon: React.ReactNode }) {
  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2',
    lg: 'p-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
    success: 'bg-success-600 hover:bg-success-700 text-white',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white',
    warning: 'bg-warning-600 hover:bg-warning-700 text-white',
    outline: 'bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white',
  };

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center
        transition-all duration-300 ease-in-out
        ${props.disabled ? 'opacity-70 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
} 