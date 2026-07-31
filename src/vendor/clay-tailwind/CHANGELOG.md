# @bolteu/clay-tailwind

## 1.1.0

### Minor Changes

- [#2238](https://github.com/bolteu/kalep/pull/2238) [`dcf2df5`](https://github.com/bolteu/kalep/commit/dcf2df54603f07b669e92920a7b6580c3160722f) Thanks [@arturluik](https://github.com/arturluik)! - Moved global base styles (`html` text color, light/dark `color-scheme`, box-sizing reset, RTL icon mirroring) and the indeterminate `ProgressBar` sweep animation (`animate-indeterminate-progress`) from `@bolteu/clay-react`'s `clay.css` into `@bolteu/clay-tailwind`'s `index.css`.

  `@bolteu/clay-react`'s `clay.css` already imports `@bolteu/clay-tailwind`, so this is a non-breaking internal move — existing consumers of `@bolteu/clay-react/css` see no change in output. Consumers who import `@bolteu/clay-tailwind` directly (without `@bolteu/clay-react`) now also get these base styles and the animation utility.

## 1.0.0

### Major Changes

- [#2196](https://github.com/bolteu/kalep/pull/2196) [`840030b`](https://github.com/bolteu/kalep/commit/840030ba1ceb6b2641f15fa5d1bad42a5ce6161b) Thanks [@KoitsaluR](https://github.com/KoitsaluR)! - 1.0.0 for clay-react and clay-tailwind

## 0.2.0

### Minor Changes

- [#2190](https://github.com/bolteu/kalep/pull/2190) [`0c6e9cf`](https://github.com/bolteu/kalep/commit/0c6e9cf92ab3e6e28b28a175bb6587f35d7ead67) Thanks [@runewizard](https://github.com/runewizard)! - Removes z-index class utilities from from clay-tailwind.
  Removes usage of such utilities from many clay components.
  Adds minor fixes to the Drawer.

## 0.1.1

### Patch Changes

- [#2180](https://github.com/bolteu/kalep/pull/2180) [`0a05bd3`](https://github.com/bolteu/kalep/commit/0a05bd3b43fdad15e4526416c594b0750153a0bb) Thanks [@runewizard](https://github.com/runewizard)! - Add new Tabs compound component built on Base UI primitives. Provides `Tabs.Root`, `Tabs.List`, `Tabs.Tab`, `Tabs.Panel`, and `Tabs.Indicator` subparts with Kalep design tokens, size variants (sm/md), full keyboard navigation, and ARIA compliance. Available via `@bolteu/clay-react` and re-exported through the `baseui-components/Tabs` shim in `@bolteu/kalep-react`.
  Fix `clay-tailwind` missed colors.

## 0.1.0

### Minor Changes

- [#2159](https://github.com/bolteu/kalep/pull/2159) [`9668fa9`](https://github.com/bolteu/kalep/commit/9668fa9ed070463e2bad3a23723b79e49ec9c594) Thanks [@KoitsaluR](https://github.com/KoitsaluR)! - Initial release of @bolteu/clay-tailwind. Tailwind CSS v4 configuration for the Clay Design System: design tokens via `@theme`, semantic color utilities, `bolt-font-*` typography utilities, and custom variants (`input-clear-button`, `slider-thumb`, `slider-track`). Maps the same class names to the same values as `@bolteu/kalep-tailwind` (TW3) so consumers can migrate independently. - WAVE-420
