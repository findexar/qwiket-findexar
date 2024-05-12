import React from 'react';
//@ts-ignore
import { TransitionGroup, CSSTransition } from 'react-transition-group'; // Import TransitionGroup and CSSTransition

interface TabProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  value?: any; // Added value property to TabProps
  disabled?: boolean; // Added disabled property to TabProps
  iconPosition?: string; // Added iconPosition property to TabProps
}

const Tab: React.FC<TabProps> = ({ label, selected, onClick, value, disabled, iconPosition = "start" }) => {
  return (
    <button
      className={`py-2 px-4 text-sm font-medium text-center transition duration-500 ease-in-out ${selected ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-600'} focus:outline-none`}
      onClick={onClick}
      value={value} // Added value attribute to button
      disabled={disabled} // Added disabled attribute to button
     >
      {label}
    </button>
  );
};

interface TabsProps {
  children: React.ReactNode;
  textColor?: string; // Added textColor property to TabsProps
  variant?: string; // Added variant property to TabsProps
  value?: any; // Added value property to TabsProps
  onChange?: (event: React.SyntheticEvent, newValue: any) => void; // Added onChange property to TabsProps
  scrollButtons?: boolean; // Changed scrollButtons property to boolean in TabsProps
  allowScrollButtonsMobile?: boolean; // Added allowScrollButtonsMobile property to TabsProps
}

const Tabs: React.FC<TabsProps> = ({ children, textColor, variant, value, onChange, scrollButtons = false, allowScrollButtonsMobile = false }) => {
  const handleTabChange = (event: React.SyntheticEvent, newValue: any) => {
    if (onChange) {
      onChange(event, newValue);
    }
  };

  const scrollable = variant === 'scrollable';
  const scrollClass = scrollable && scrollButtons ? 'overflow-x-auto' : '';

  return (
    <div className={`flex space-x-4 ${textColor ? textColor : ''} ${variant === 'fullWidth' ? 'w-full' : ''} ${scrollClass}`}>
      <TransitionGroup className="tab-transition-group">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return (
              <CSSTransition
                key={index}
                timeout={500}
                classNames={{
                  enter: 'tab-enter',
                  enterActive: 'tab-enter-active',
                  exit: 'tab-exit',
                  exitActive: 'tab-exit-active'
                }}
              >
                {React.cloneElement(child, {
                  ...child.props,
                  onClick: (event: React.SyntheticEvent) => {
                    handleTabChange(event, index);
                    if (child.props.onClick) {
                      child.props.onClick();
                    }
                  },
                  selected: value === index,
                  allowScrollButtonsMobile: allowScrollButtonsMobile, // Pass allowScrollButtonsMobile to each Tab
                  iconPosition: "start" // Pass iconPosition to each Tab
                })
              }
              </CSSTransition>
            );
          }
          return child;
        })}
      </TransitionGroup>
    </div>
  );
};

export { Tabs, Tab };
