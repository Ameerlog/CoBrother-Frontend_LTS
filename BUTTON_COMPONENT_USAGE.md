# Button Component Usage Guide

## Overview
A reusable, professional Button component that provides consistent styling across the entire CoBrother application.

## Import

```jsx
import Button from '../components/common/Button';
// Or use named exports for convenience
import { ProfessionalButton, PrimaryButton, DangerButton } from '../components/common/Button';
```

## Professional Button Variants (Recommended)

### Default Professional Button
Purple border with white background. On hover: fills with purple, white text.

```jsx
<Button variant="professional">
  Click Me
</Button>

// Or use the named export
<ProfessionalButton>Click Me</ProfessionalButton>
```

### Small Professional Button
```jsx
<Button variant="professional-sm">
  Small Button
</Button>

// Or
<ProfessionalButtonSm>Small Button</ProfessionalButtonSm>
```

### Large Professional Button
```jsx
<Button variant="professional-lg">
  Large Button
</Button>

// Or
<ProfessionalButtonLg>Large Button</ProfessionalButtonLg>
```

## Legacy Button Variants

### Primary Button
Gradient purple background with white text.

```jsx
<Button variant="primary">
  Primary Action
</Button>

// Or
<PrimaryButton>Primary Action</PrimaryButton>
```

### Secondary Button
Gray border with transparent background.

```jsx
<Button variant="secondary">
  Secondary Action
</Button>

// Or
<SecondaryButton>Secondary Action</SecondaryButton>
```

### Danger Button
Red background for destructive actions.

```jsx
<Button variant="danger">
  Delete
</Button>

// Or
<DangerButton>Delete</DangerButton>
```

### Ghost Button
Minimal styling with hover effect.

```jsx
<Button variant="ghost">
  Cancel
</Button>

// Or
<GhostButton>Cancel</GhostButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | string | `'professional'` | Button style variant |
| `size` | string | `'md'` | Size for legacy variants: 'sm', 'md', 'lg' |
| `to` | string | - | React Router Link path |
| `href` | string | - | External URL (renders as `<a>`) |
| `onClick` | function | - | Click handler |
| `disabled` | boolean | `false` | Disabled state |
| `className` | string | `''` | Additional CSS classes |
| `type` | string | `'button'` | Button type: 'button', 'submit', 'reset' |
| `children` | ReactNode | - | Button content |

## Usage Examples

### As a Link (React Router)
```jsx
<Button variant="professional" to="/ventures">
  View Ventures →
</Button>
```

### As an External Link
```jsx
<Button variant="professional" href="https://example.com">
  Visit Website
</Button>
```

### With Click Handler
```jsx
<Button variant="professional" onClick={() => console.log('Clicked!')}>
  Click Me
</Button>
```

### With Icons
```jsx
import { Plus, Trash2 } from 'lucide-react';

<Button variant="professional">
  <Plus size={16} /> Add New
</Button>

<Button variant="danger">
  <Trash2 size={16} /> Delete
</Button>
```

### Disabled State
```jsx
<Button variant="professional" disabled>
  Loading...
</Button>
```

### Submit Button in Form
```jsx
<form onSubmit={handleSubmit}>
  <Button type="submit" variant="professional">
    Submit Form
  </Button>
</form>
```

### With Additional Classes
```jsx
<Button variant="professional" className="w-full">
  Full Width Button
</Button>
```

## Migration from Old Buttons

### Before (Old Style)
```jsx
<button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">
  Click Me
</button>
```

### After (New Component)
```jsx
<Button variant="professional">
  Click Me
</Button>
```

### Before (Link with Tailwind)
```jsx
<Link to="/ventures" className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-full hover:bg-purple-600 hover:text-white">
  View Ventures
</Link>
```

### After (Button Component)
```jsx
<Button variant="professional" to="/ventures">
  View Ventures
</Button>
```

## Best Practices

1. **Use Professional variant by default** - It provides the most modern, consistent look
2. **Use appropriate sizes** - `professional-sm` for compact areas, `professional-lg` for hero sections
3. **Prefer `to` prop for internal navigation** - Automatically renders as React Router Link
4. **Use `href` for external links** - Renders as anchor tag with proper attributes
5. **Always provide meaningful button text** - Avoid generic "Click here"
6. **Use icons to enhance clarity** - But don't rely on icons alone

## CSS Classes Applied

The component automatically applies the appropriate CSS classes from `professional-ui.css`:

- `.btn-professional` - Default professional button
- `.btn-professional-sm` - Small professional button
- `.btn-professional-lg` - Large professional button

These classes provide:
- Purple border (2px solid #9440dd)
- Transparent background
- Purple text (#9440dd)
- Smooth hover transition to filled purple background with white text
- Professional rounded corners (border-radius: 9999px)
- Subtle shadow on hover

## File Location

**Component:** `src/components/common/Button.jsx`
**Styles:** `src/styles/professional-ui.css`

## Support

For issues or questions about the Button component, check:
1. This documentation
2. The component source code
3. The professional-ui.css file for styling details
