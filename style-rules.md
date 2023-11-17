# Style rules
1. Tabs should be two spaces. 


1. [React]()

1. [TypeScript]()
<!-- CSS -->

## React
### Destructure your props.
```js
// YES
const ComponentName =({value})=>{

}
// NO
const ComponentName =(props)=>{
  const value = props.value;
}
```
#### Why?
Less typing.

### Use named exports from modules.
```jsx
// YES
import {useEffect} from 'react'

// NO
import * as 'React' from 'react'
```
#### Why?
Less typing.

### Use arrow functions unless you have a reason not to.
```js
// YES
const handleChange = () =>{

}
// NO
// function declaration
function handleChange(){

}
```

#### Why?
Arrow functions inherit their `this` value from their parent. Function declarations/expressions do not.  

Always choosing arrow functions means we can expect more consistent `this` values.

## TypeScript
### Favor interfaces over type aliases
And name your interfaces starting with I.

```typescript
// YES
interface IToolTip {
  id: number;
  text: string;
  close: () => void;
}

// NO
type ToolTip = {
  id: number;
  text: string;
  close: () => void;
}
```

### Why? 
Interfaces can be extended:
```js
interface IToolTip {
  id: number;
  text: string;
  close: () => void;
}

interface IToolTip {
  icon: string;
}

// Now IToolTip has 4 properties.
```

Type aliases cannot:
```js
type ToolTip = {
  text: string;
};

type ToolTip = {
  id: number;
};
// Error at runtime that says "Identifier ToolTip has already been declared."

```
Allowing extension means we're slightly less likely to break something if we accidentally create an interface twice **and** we don't have to mess with the original type definition if we just want to add something for our component.

Also, the TS docs [recommend using interfaces over type aliases](https://www.typescriptlang.org/play?#code/PTAEBUAsFMCdtAQ3qALgdwPagLaIJYB2ammANgM4mgAm0AxmcgqjKBZIgA4KYBmSQgCgQoTACMAVg1QAuUEVRw+ietCqJCNNAE8eSMvkQV1AOhHALEGDqQoAbnFsV8OfE1gAaQdr6ZYaGw4mBSooPSYOMHE9MbqVqphrAgUiDjQ5kKoeggAQviwNOA5oAC8oADeQqCg6EQA5hTyAEwA3EIAvu1CisqqeQU0AJKESrAqapXVtQ1NoG2dQkIRhKGg4oMAjPL5hcX65RUzhI0toF3LmKthG4XNO4MjYxMIh8en8+fdorkMiACuJggOQAyvRYPguGF8Bp2KhYP96Kh-rBEGRdPoKDpQtAcJ4rPhUAByKhcEIucRkFjYXqwNwAD0C0AKoEB1MwmRWa1uNAAzA9Ck8+pNyjzNt8wFBoLZxJhWOx-lwybAwtB6UotA0xMkArSXhotBizFZ9gg0UYTFQaNhWDDQPYjApRnATEj8FcjRRvOhIO5oATneN+lROI4kKAANbSrCFTLZfQAeXQ6LehEwSJRhDR8nh-wQHVAADJQLsijl2vGEAAlCREMqVUBpjOwLNkeQqSj5oslx6Bl7dPX9UAABWgqnTEdAao1NCopdNUxqETImBRfH+bbQCOg7RqfEM6nbaJM7Q6PT7Q4Awr76FHiNPoFo573nkOqkvyKvxhuj53d6B93wQ8AOPHdFiEKkwkwZN5CTFMGzqE45mabwm2RFtsy3PMvgg6AwnoG873ka98FvR96yORCPhQ8JPzXH8QM7bxAOAjsgQuE1ODCVJ8Bob0EHgCIokfbQdFXVkgUHNQqEwRwAkrBJDDiChTFAEEeHofA+FItEyB0bxxD+NlQDE-4ZjIdF6jw9Y8LGKdYFgfwrHSChUislTQCGARTNASBZLgMQ5KZADyBXKj7Mc2AvRM8TYmEUQTAQPz0GBHgwQhKFwk0UAuEch06DQF0As0bRghQPx6DZGhnPUNz1FqGBiBjCMtTqeUpPqwwo1AEiyMITJoPggjSLvdphr6+tBolUAE0IBA8EkfxaC0vg4EfSZDIwaByMrAwLXq+wqA6igEhQVhEGhC9pLsXgeGIEqjT25SbvCFcTBocxRCgO10k0KgfLiqd1REwQnVfDbbDoRhkC1QkEnYBgrm0VBXAyJYOtAABpQkNUXHKUSi+RZXIMdCFPdGroQbHUFx99aJXFF5FCCETnJqwRmCuUYACWIgUQR64rTG4EAIzQrO0VdUBcAr+AJKXaAYDwLvdfqll24dFS4WxDmmZd-CZ+EGlPbp1c17W8dQTBsXkQh-hwQzYGNpYuTCZB6wACnsbMNaVHQAEoygAPjprkSdMFd6k9tE-cWZB3YqPXYFkIkdGgCzoKJDoY6sAARaA7poLUPVMgJ6kwY9vFtK0VrWwhJgiDdtEMpArDJFwUbDJb+bm+plccVSAAloOgIK-ACLh-kpUi9KBtvoGq0RK2iwkSXDTa7NiCzqDwbrkhwUGOsyURZt4ARkhstZ4AoL9rrHhHmROAx0X4YL56sqxefq5BV0NJf7SOym0Uq5wlUJOfy4wwpWFYPARA2g7T8zLpgbQXAmCTEtiAlUsgliiEgDTLgTQQChFAeA-c0FTBCWAAARzzKEFWFBgC8gAOzNF5Ew3kABWYAS9wSQlQAAWmOnww6fCl7AHYc0AAbAADmaLIgADAAYnEdI2RzQ5FCCAA) because the error messages are better. 


> If you don't see what you need, use [the Airbnb rules](https://github.com/airbnb/javascript#airbnb-javascript-style-guide-).