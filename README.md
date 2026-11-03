# Legend List sticky SectionList header repro (iOS)

Minimal Expo app showing [@legendapp/list](https://github.com/LegendApp/legend-list) **SectionList** sticky section headers staying at the wrong vertical offset after the dataset changes (rows inserted into existing sections).

Related upstream issue: [LegendApp/legend-list#445](https://github.com/LegendApp/legend-list/issues/445).

## Environment

| Package | Version |
|---------|---------|
| `@legendapp/list` | **3.7.0** (pinned) |
| Expo SDK | 58 |
| React Native | 0.88 |
| React | 19.3 |
| New Architecture | enabled (`newArchEnabled: true` in `app.json`) |

## Run

```bash
npm install
npx expo start --ios
```

Use Expo Go on the iOS Simulator or a device on the same network.

## Reproduce

1. Leave **Sticky headers** on (default).
2. Open the **Payments** tab (default).
3. Scroll the list down so several day sections are visible.
4. Tap **All**.

**Expected:** day headers (e.g. “31 October”) move down with their sections as top-up rows appear in each day.

**Actual (iOS):** one or more headers stay at their old offset and paint over rows from the previous section. Most visible when switching from **Payments** → **All** (rows added above/between visible content).

## Workarounds (in-app toggles)

- **Sticky headers** off → layout is correct (headers scroll away; no stickiness).
- **Remount list on filter** on → same as `key={filter}` on the list; fixes misplaced sticky headers at the cost of scroll position.

## Test @legendapp/list 3.7.1

`main` pins **3.7.0**. To try **3.7.1** (changelog: row reposition after insert/remove/reorder):

```bash
npm install @legendapp/list@3.7.1 --save-exact
npx expo start --ios
```

Then repeat the repro steps above.

## License

MIT (app code only; Legend List is MIT separately).
