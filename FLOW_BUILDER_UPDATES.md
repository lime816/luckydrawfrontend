# Flow Builder Updates - Implementation Guide

This document contains all the changes that need to be applied to the Lucky-draw flow builder.

## ✅ ALL UPDATES COMPLETED

### 1. **types.ts** ✅
- Added PhotoPicker, DocumentPicker types
- Added TextArea maxLength and helperText properties

### 2. **state/store.ts** ✅
- Updated Image/ImageCarousel to use base64 encoded images
- Added PhotoPicker default with all properties
- Added DocumentPicker default with all properties

### 3. **components/Palette.tsx** ✅
- Added Camera and Upload icons
- Added PhotoPicker to Media category
- Added DocumentPicker to Media category
- Added ImageCarousel to Media category

### 4. **utils/jsonBuilder.ts** ✅ CRITICAL
- Added PhotoPicker, DocumentPicker, Footer to isFormElement()
- Updated buildScreen() to sort Footer to end of Form children
- Added PhotoPicker/DocumentPicker example values
- Updated TextInput to always include input-type (default: 'text')
- Updated TextArea to support max-length and helper-text
- Added PhotoPicker JSON export with all properties
- Added DocumentPicker JSON export with all properties
- Fixed Footer payload to exclude Footer itself

### 5. **components/Canvas.tsx** ✅
- Added PhotoPicker visual rendering
- Added DocumentPicker visual rendering
- Both show upload areas with icons and descriptions

## 📋 TABS STATUS (Already Working)
Add PhotoPicker and DocumentPicker to `createElement` function and update Image/ImageCarousel defaults:

```typescript
case 'Image':
  return { id, type, src: 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAKCAIAAAAsFXl4AAAANElEQVR4nGL5ctWagWjwuH0b8YqZiFdKKhg1Gg2wzOawIV61t1AF8YqHZoAMTaMBAQAA//9ljAXx5eZ2mwAAAABJRU5ErkJggg==', altText: 'Sample image' }

case 'ImageCarousel':
  return { id, type, images: [
    { 
      src: 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAKCAIAAAAsFXl4AAAANElEQVR4nGL5ctWagWjwuH0b8YqZiFdKKhg1Gg2wzOawIV61t1AF8YqHZoAMTaMBAQAA//9ljAXx5eZ2mwAAAABJRU5ErkJggg==', 
      altText: 'Landscape image' 
    },
    { 
      src: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAALElEQVR4nGIRPRrBgATeWLsjc5kY8AKaSrPIL3FA5i9evZNudhOQBgQAAP//2DAFw06W30wAAAAASUVORK5CYII=', 
      altText: 'Square image' 
    }
  ] }

case 'PhotoPicker':
  return { 
    id, 
    type, 
    name: 'photo_picker', 
    label: 'Upload Photos',
    description: 'Select photos from your gallery or take new ones',
    photoSource: 'camera_gallery',
    maxFileSizeKb: 10240,
    minUploadedPhotos: 0,
    maxUploadedPhotos: 10
  }

case 'DocumentPicker':
  return { 
    id, 
    type, 
    name: 'document_picker', 
    label: 'Upload Documents',
    description: 'Select documents to upload',
    maxFileSizeKb: 10240,
    minUploadedDocuments: 0,
    maxUploadedDocuments: 10,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
  }
```

### 3. utils/jsonBuilder.ts

#### A. Update `isFormElement` function:
```typescript
function isFormElement(element: any): boolean {
  const formElementTypes = [
    'TextInput', 'EmailInput', 'PasswordInput', 'PhoneInput', 'TextArea',
    'CheckboxGroup', 'RadioButtonsGroup', 'ChipsSelector', 'Dropdown', 'OptIn',
    'DatePicker', 'CalendarPicker',
    'PhotoPicker', 'DocumentPicker',  // Media upload components MUST be in Form
    'Footer'  // Footer should be in Form when collecting form data
  ]
  return formElementTypes.includes(element.type)
}
```

#### B. Update `buildScreen` function to sort Footer to end:
```typescript
// If there are form elements, wrap them in a Form component
if (formElements.length > 0) {
  // CRITICAL: Footer MUST be the last element in Form children
  const footerElements = formElements.filter(el => el.type === 'Footer')
  const otherFormElements = formElements.filter(el => el.type !== 'Footer')
  
  children.push({
    type: 'Form',
    name: 'flow_path',
    children: [...otherFormElements, ...footerElements]  // Footer at the end
  })
}
```

#### C. Update `getExampleValue` function:
```typescript
case 'PhotoPicker':
  return '["media_id_1", "media_id_2"]'
case 'DocumentPicker':
  return '["media_id_1"]'
```

#### D. Update `TextInput` case in `mapElement`:
```typescript
case 'TextInput': {
  const result: any = { 
    type: 'TextInput',
    'input-type': el.inputType || 'text',  // Default to 'text' if not specified
    label: el.label, 
    name: el.name
  }
  if (el.required !== undefined) result.required = el.required
  if (el.pattern) result.pattern = el.pattern
  if (el.helperText) result['helper-text'] = el.helperText
  if (el.minChars) result['min-chars'] = el.minChars
  if (el.maxChars) result['max-chars'] = el.maxChars
  return result
}
```

#### E. Update `TextArea` case:
```typescript
case 'TextArea': {
  const result: any = { 
    type: 'TextArea', 
    label: el.label, 
    name: el.name
  }
  if (el.required !== undefined) result.required = el.required
  if (el.maxLength) result['max-length'] = el.maxLength
  if (el.helperText) result['helper-text'] = el.helperText
  return result
}
```

#### F. Add PhotoPicker case:
```typescript
case 'PhotoPicker': {
  const result: any = { 
    type: 'PhotoPicker', 
    name: el.name,
    label: el.label,
    'photo-source': el.photoSource || 'camera_gallery',
    'min-uploaded-photos': el.minUploadedPhotos !== undefined ? el.minUploadedPhotos : 0,
    'max-uploaded-photos': el.maxUploadedPhotos || 10,
    'max-file-size-kb': el.maxFileSizeKb || 10240
  }
  if (el.description) result.description = el.description
  if (el.enabled !== undefined) result.enabled = el.enabled
  if (el.visible !== undefined) result.visible = el.visible
  if (el.errorMessage) result['error-message'] = el.errorMessage
  return result
}
```

#### G. Add DocumentPicker case:
```typescript
case 'DocumentPicker': {
  const result: any = { 
    type: 'DocumentPicker', 
    name: el.name,
    label: el.label,
    'min-uploaded-documents': el.minUploadedDocuments !== undefined ? el.minUploadedDocuments : 0,
    'max-uploaded-documents': el.maxUploadedDocuments || 10,
    'max-file-size-kb': el.maxFileSizeKb || 10240
  }
  if (el.description) result.description = el.description
  if (el.allowedMimeTypes && el.allowedMimeTypes.length > 0) result['allowed-mime-types'] = el.allowedMimeTypes
  if (el.enabled !== undefined) result.enabled = el.enabled
  if (el.visible !== undefined) result.visible = el.visible
  if (el.errorMessage) result['error-message'] = el.errorMessage
  return result
}
```

#### H. Update Footer payload to exclude Footer itself:
```typescript
// In both navigate and complete actions, change:
const currentScreenFormFields = currentScreen.elements.filter((elem: any) => 
  'name' in elem && elem.name && elem.type !== 'Footer'
)
```

### 4. components/Palette.tsx
Add imports and component definitions:

```typescript
import { 
  Type, CheckCircle, MessageSquare, ChevronDown, ArrowRight, Plus, Edit3, Mail, Lock, Phone,
  FileText, Hash, AlignLeft, Calendar, CalendarDays, Image, Link, 
  CheckSquare, Navigation, Layers, Palette as PaletteIcon, Images, Camera, Upload
} from 'lucide-react'

// In the types array, add to Media category:
{ key: 'Image', label: 'Image', icon: <Image className="w-4 h-4" />, description: 'Display image', category: 'Media' },
{ key: 'ImageCarousel', label: 'Image Carousel', icon: <Images className="w-4 h-4" />, description: 'Image slideshow', category: 'Media' },
{ key: 'PhotoPicker', label: 'Photo Picker', icon: <Camera className="w-4 h-4" />, description: 'Upload photos', category: 'Media' },
{ key: 'DocumentPicker', label: 'Document Picker', icon: <Upload className="w-4 h-4" />, description: 'Upload documents', category: 'Media' },
```

### 5. components/Canvas.tsx
Add rendering cases before NavigationList:

```typescript
case 'PhotoPicker':
  return (
    <div onClick={onClick} className={baseClass}>
      <label className="text-sm font-medium text-gray-700 block mb-2">{el.label || 'Photo Picker'}</label>
      {el.description && <p className="text-xs text-gray-500 mb-2">{el.description}</p>}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
        <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xl">📷</span>
        </div>
        <p className="text-xs text-gray-600">Upload Photos</p>
        <p className="text-xs text-gray-400 mt-1">
          {el.photoSource === 'camera' ? 'Camera' : el.photoSource === 'gallery' ? 'Gallery' : 'Camera/Gallery'}
        </p>
        {(el.minUploadedPhotos || el.maxUploadedPhotos) && (
          <p className="text-xs text-gray-400 mt-1">
            {el.minUploadedPhotos || 0}-{el.maxUploadedPhotos || 30} photos
          </p>
        )}
      </div>
    </div>
  )

case 'DocumentPicker':
  return (
    <div onClick={onClick} className={baseClass}>
      <label className="text-sm font-medium text-gray-700 block mb-2">{el.label || 'Document Picker'}</label>
      {el.description && <p className="text-xs text-gray-500 mb-2">{el.description}</p>}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
        <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-xl">📄</span>
        </div>
        <p className="text-xs text-gray-600">Upload Documents</p>
        {el.allowedMimeTypes && el.allowedMimeTypes.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {el.allowedMimeTypes.slice(0, 2).join(', ')}
            {el.allowedMimeTypes.length > 2 && '...'}
          </p>
        )}
        {(el.minUploadedDocuments || el.maxUploadedDocuments) && (
          <p className="text-xs text-gray-400 mt-1">
            {el.minUploadedDocuments || 0}-{el.maxUploadedDocuments || 30} docs
          </p>
        )}
      </div>
    </div>
  )
```

### 6. components/PropertyEditorInline.tsx
Add property editor cases before NavigationList case - see full implementation in whatsapp-flow-builder version.

### 7. components/FlowPreviewPane.tsx
This is a large file with many changes. Key updates:
- Add Form component handling
- Add all media component rendering
- Add kebab-case property support
- Improve styling with WhatsApp colors

See the full implementation in the whatsapp-flow-builder version.

## Important Notes

1. **PhotoPicker and DocumentPicker cannot be on the same screen** - WhatsApp limitation
2. **Base64 images** are required for Image and ImageCarousel
3. **Footer must be last** in Form children
4. **input-type is required** for TextInput (not TextArea)
5. All form elements must be wrapped in Form component

## Testing Checklist

- [ ] PhotoPicker appears in palette
- [ ] DocumentPicker appears in palette
- [ ] Can drag and drop both components
- [ ] Properties can be edited
- [ ] JSON export includes correct kebab-case properties
- [ ] Footer is always last in Form
- [ ] Image/ImageCarousel use base64 by default
- [ ] Flow preview renders all components correctly
