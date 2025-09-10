# Three.js / splatter.app integration demo

This is an example of integrating [splatter.app](https://splatter.app) in a simple Three.js application. 

To run it, first do `npm install` and then run `npx vite`.

![](assets/demo.jpg)

## API

A minimum integration consists of these steps:

```js
import { Splatter } from 'splatter-three';
const splatter = new Splatter(context, {splatId: '7yr-idb'});
```

Then render the splats at the end of the frame, over existing opaque Three.js content.
Depth testing ensures correct visibility/occlusion of the content.
```js
splatter.render(camera);
```

## Licensing

The `splatter-three` module is available for licensing to Business and Enterprise customers. Please contact [info@splatter.app](mailto:info@splatter.app) to get access.


