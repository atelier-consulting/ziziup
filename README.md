ziziup-slicing
===

HTML and CSS for ZIZIUP

### Running
#### Initial setup
1. Install Node.js and `npm`.
1. Clone this repository.
1. Install dependencies: `npm install`.

#### Runing for development
`npm run dev`

This opens index.html in default browser and starts watcher, so all changes in
`src` folder are reflected in that window immediately, without manual page
reload. If you accidentally close browser window, you can find it at
[http://localhost:3000](http://localhost:3000)

#### Building for demo
`npm run demo`

This places completely independent demo version into `demo` folder.

#### Building for production
`npm run build`

This places minified styles and images to `prod` folder.

### Conventions
#### BEM class naming
We're using three levels deep BEM notation: **Block** => **Element** =>
**Modifier**. Element separator is double underscore – `__`, modifier separator
is double dash – `--`, word separator is single dash – `-`.

Example: `block-name__element-name--modifier-name`, `tabbar__tab--active`.


We're using multi-class pattern to describe modifications to block or element.
Example: `<div class="tabbar__tab tabbar__tab--active">...</div>`.

#### Code style
- 2 spaces indent;
- Lowercase variables, selectors and attributes;
- Empty line at the end of file;
- Comma-delimited selectors on separate line;
- SASS variable names must be abstracted out of its values (`$color-blue` is
wrong) and follow `$generic-specific-variation` pattern, e.g.,
`$color-brand-primary`. Please use dash (`-`) as word separator.
