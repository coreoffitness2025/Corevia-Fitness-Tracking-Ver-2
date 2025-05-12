import React from 'react';

// 플랫폼 독립적인 Card 컴포넌트 타입
export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

// 스타일을 분리하여 관리 - 플랫폼 독립적
export const getCardStyles = (hasTitle: boolean, hasAction: boolean, hasPadding: boolean, isDarkMode: boolean) => {
  return {
    container: `bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all duration-300 overflow-hidden ${hasTitle ? '' : 'hover:shadow-md'}`,
    header: `flex items-center justify-between p-4 ${hasTitle ? 'border-b border-gray-100 dark:border-gray-700' : ''}`,
    title: 'text-lg font-bold',
    subtitle: 'text-sm text-gray-500 dark:text-gray-400 mt-1', 
    content: `${hasPadding ? 'p-4' : ''}`,
    footer: 'px-4 py-3 bg-gray-50 dark:bg-gray-700/50',
  };
};

// 웹 환경에서의 Card 컴포넌트 구현
const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  onClick,
  footer,
  headerAction,
}) => {
  const hasTitle = !!title;
  const hasAction = !!headerAction;
  const hasPadding = true;
  
  // 실제 구현에서는 theme context에서 가져와야 함
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const styles = getCardStyles(hasTitle, hasAction, hasPadding, isDarkMode);

  return (
    <div 
      className={`${styles.container} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {(title || icon) && (
        <div className={styles.header}>
          <div className="flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            <div>
              {title && <h3 className={styles.title}>{title}</h3>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      
      <div className={styles.content}>
        {children}
      </div>
      
      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 ${className}`}>
      {children}
    </h3>
  );
}

export function CardSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-6 animate-slideUp ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
} 