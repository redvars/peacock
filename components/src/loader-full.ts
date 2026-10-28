// The full build: everything loader.js loads, with Material Symbols from the icons shipped in
// dist/icons/ instead of cdn.jsdelivr.net, so pages work without internet access and under a
// content security policy that keeps requests on their own origin. Carbon icons still come from
// the CDN. shipped-icons.js comes first, so no icon is fetched before the base is set.
import './shipped-icons.js';
import './loader.js';
