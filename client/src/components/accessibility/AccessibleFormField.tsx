import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface AccessibleFormFieldProps {
  control: any;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'textarea' | 'select' | 'checkbox';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  autoComplete?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Componente per rendere i campi di form accessibili con etichette, 
 * descrizioni e attributi ARIA appropriati
 */
export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  control,
  name,
  label,
  description,
  placeholder,
  type = 'text',
  options,
  required = false,
  autoComplete,
  min,
  max,
  disabled = false,
  className = '',
}) => {
  // Costruisci un ID unico per associare label e input
  const fieldId = `field-${name}-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel htmlFor={fieldId} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
            {label}
          </FormLabel>
          
          <FormControl>
            {type === 'textarea' ? (
              <Textarea
                id={fieldId}
                placeholder={placeholder}
                disabled={disabled}
                aria-required={required}
                aria-invalid={fieldState.invalid ? 'true' : 'false'}
                aria-describedby={description ? `${fieldId}-description` : undefined}
                {...field}
              />
            ) : type === 'select' ? (
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                defaultValue={field.value}
                aria-required={required}
                aria-invalid={fieldState.invalid ? 'true' : 'false'}
                aria-describedby={description ? `${fieldId}-description` : undefined}
              >
                <SelectTrigger id={fieldId}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={fieldId}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                  aria-required={required}
                  aria-invalid={fieldState.invalid ? 'true' : 'false'}
                  aria-describedby={description ? `${fieldId}-description` : undefined}
                />
                {description && (
                  <label 
                    htmlFor={fieldId} 
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {description}
                  </label>
                )}
              </div>
            ) : (
              <Input
                id={fieldId}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                disabled={disabled}
                aria-required={required}
                aria-invalid={fieldState.invalid ? 'true' : 'false'}
                aria-describedby={description ? `${fieldId}-description` : undefined}
                min={min}
                max={max}
                {...field}
              />
            )}
          </FormControl>
          
          {description && type !== 'checkbox' && (
            <FormDescription id={`${fieldId}-description`} className="sr-only">
              {description}
            </FormDescription>
          )}
          
          <FormMessage aria-live="assertive" />
        </FormItem>
      )}
    />
  );
};

export default AccessibleFormField;