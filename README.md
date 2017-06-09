ziziup-slicing
===

HTML and CSS for ZIZIUP

## Initial setup
1. Install Node.js and `npm`.
1. Clone this repository.
1. Install dependencies: `npm install`.

## Pipelines
### Development: `npm run dev`
This opens `src/index.html` in default browser and starts watcher, so all
changes in `src` folder are reflected in that window immediately, without manual
page reload. If you accidentally close browser window, you can find it at
[http://localhost:3000](http://localhost:3000)

### Demo: `npm run demo`
This places completely independent demo version into `demo` folder. Due to
relative nature of paths used, demo build works only when served from web
server, not from file system.

### Production: `npm run build`
This places minified styles and images to `prod` folder.

## Managing categories settings
All categories settings and assets are grouped by unique category **TOKEN** – a
string that serves as ID for that category, e.g. `sports`, `mens-fashion` etc.
It's used for all stylings, assets and configurations:
* Category images are named `category-%TOKEN%.png` and located in `src/img` folder.
* Category config, such as colors, banner and various plates styles are located
in `src/sass/variables/_categories.scss`. There's `$config-catgories` variable,
which is *SASS key-value map*, where top-level keys are TOKENS.

It is possible to generate that *SASS map* from JSON. This gives you ability to
store styling data in database and change values like category colors or image
scalings in some sort of admin interface, then export changed data back to *SASS
map* and generate updated minified css via default production build pipeline -
`npm run build`. Ping me when you'll need this functionality.


## Development conventions
### BEM class naming
We're using three levels deep BEM notation: **Block** => **Element** =>
**Modifier**. Element separator is double underscore – `__`, modifier
is double dash – `--`, word separator is single dash – `-`.

Example: `block-name__element-name--modifier-name`, `tabbar__tab--active`.


We're using multi-class pattern to describe modifications to block or element.
Example: `<div class="tabbar__tab tabbar__tab--active">...</div>`.

### Code style
- 2 spaces indent;
- Lowercase variables, selectors and attributes;
- Empty line at the end of file;
- Comma-delimited selectors on separate line;
- SASS variable names must be abstracted out of its values (`$color-blue` is
wrong) and follow `$generic-specific-variation` pattern, e.g.,
`$color-brand-primary`. Please use dash (`-`) as word separator.
