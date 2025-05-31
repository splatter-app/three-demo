# Three.js / splatter.app integration demo

This is an example of integration of [splatter.app](https://splatter.app) in a simple Three.js application. 

To run it, first do `npm install` and then run `npx vite`.

## API

A minimum integration consists of these steps:

```js
import { Splatter } from 'splatter-three';
const splatter = new Splatter(context, {splatId: '7yr-idb'});
```

Render the splats at the end of the frame over opaque Three.js content (with depth testing):
```js
splatter.render(camera);
```

## Licensing

The integration module (`splatter-three`) is available for licensing to Business and Enterprise customers. Please contact [info@splatter.app](mailto:info@splatter.app) for licensing inquiries.


