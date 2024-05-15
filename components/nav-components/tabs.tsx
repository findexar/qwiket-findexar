import React from 'react';

const tabClasses={
  tabs1: ["py-2 px-1 text-sm font-medium text-center focus:outline-none text-slate-800 dark:text-slate-50 hover:text-slate-500 dark:hover:text-slate-100 bg-white dark:bg-slate-950",
  "py-2 px-1 text-sm font-medium text-center focus:outline-none bg-white dark:bg-slate-950 text-amber-600 dark:text-amber-200 hover:text-slate-500 dark:hover:text-amber-100 transition duration-500 ease-in-out"],
  
  tabs2: ["py-2 px-4 text-sm font-medium text-center focus:outline-none text-slate-50 hover:text-slate-500 bg-slate-600 dark:bg-slate-150",
  "py-2 px-4 text-sm font-medium text-center focus:outline-none bg-slate-600 dark:bg-slate-150 text-amber-200  dark:text-amber-200 transition duration-500 ease-in-out"],
  
  tabs3: ["py-2 px-4 text-xs md:text-sm font-medium text-center focus:outline-none text-slate-800 dark:text-slate-50 hover:text-slate-500 bg-white dark:bg-slate-950",
  "py-2 px-4 text-xs md:text-sm Ffont-medium text-center focus:outline-none box-border border-b-2 border-blue-300 dark:border-amber-500 bg-white dark:bg-slate-950 text-amber-600 hover:text-slate-500 dark:text-amber-200 dark:hover:text-slate-100 transition duration-500 ease-in-out"],

}


interface TabProps {
  label: React.ReactNode; // Changed type from string to React.ReactNode to allow React components
  selected?: boolean;
  onClick?: () => void;
  value?: any;
  disabled?: boolean;
  iconPosition?: string;
  id?: string;
}

const Tab: React.FC<TabProps> = ({ label, selected, onClick, value, disabled, iconPosition = "start", id="tabs1" }) => {
  console.log("TAB,selected ",selected,"id ",id)
  return (
    <button
      className={`${tabClasses[id as keyof typeof tabClasses][selected ? 1 : 0]} relative`}
      onClick={onClick}
      value={value}
      disabled={disabled}
     // Ensures that the button size doesn't change when selected
    >
      {label}
    </button>
  );
};

const tabsClasses={
  tabs1: "flex space-x-4 bg-white dark:bg-slate-950",
  tabs2: "flex space-x-4 bg-slate-600 dark:bg-slate-150",
  tabs3: "flex space-x-4 bg-white dark:bg-slate-950",
}

interface TabsProps {
  children: React.ReactNode;
  id:string;
  variant?: string;
  value?: any;
  onChange?: (event: React.SyntheticEvent, newValue: any) => void;
  scrollButtons?: boolean;
  allowScrollButtonsMobile?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ children, id="tabs1", variant, value, onChange, scrollButtons = false, allowScrollButtonsMobile = false }) => {
  const handleTabChange = (event: React.SyntheticEvent, newValue: any) => {
    if (onChange) {
      onChange(event, newValue);
    }
  };

  const scrollable = variant === 'scrollable';
  const scrollClass = scrollable && scrollButtons ? 'overflow-x-auto' : '';

  return (
    <div className={tabsClasses[id as keyof typeof tabsClasses]}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            onClick: (event: React.SyntheticEvent) => {
              handleTabChange(event, index);
              if (child.props.onClick) {
                child.props.onClick();
              }
            },
            selected: value === index,
            allowScrollButtonsMobile: allowScrollButtonsMobile,
            iconPosition: "start",
            id
          });
        }
        return child;
      })}
    </div>
  );
};

export { Tabs, Tab };

