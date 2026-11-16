import { defaultBaseConfig } from '@chakra-ui/react/preset-base'
import {
  tokens, semanticTokens, breakpoints, keyframes, globalCss, textStyles, layerStyles, animationStyles,
  badgeRecipe, buttonRecipe, checkmarkRecipe, headingRecipe, iconRecipe, inputRecipe,
  linkRecipe, separatorRecipe, skeletonRecipe, spinnerRecipe, textareaRecipe,
  cardSlotRecipe, dialogSlotRecipe, drawerSlotRecipe, fieldSlotRecipe, fieldsetSlotRecipe,
  fileUploadSlotRecipe, menuSlotRecipe, nativeSelectSlotRecipe, selectSlotRecipe,
  switchSlotRecipe, tableSlotRecipe, tabsSlotRecipe, toastSlotRecipe, tooltipSlotRecipe,
} from '@chakra-ui/react/theme'

// Keep the stock tokens and the recipes actually used by public and admin pages.
// Importing the full preset also retains styles for every unused Chakra widget.
export { defaultBaseConfig }
export const themePreset = {
  preflight: true,
  cssVarsPrefix: 'chakra',
  cssVarsRoot: ':where(html, .chakra-theme)',
  globalCss,
  theme: {
    tokens, semanticTokens, breakpoints, keyframes, textStyles, layerStyles, animationStyles,
    recipes: {
      badge: badgeRecipe, button: buttonRecipe, checkmark: checkmarkRecipe, heading: headingRecipe,
      icon: iconRecipe, input: inputRecipe, link: linkRecipe, separator: separatorRecipe,
      skeleton: skeletonRecipe, spinner: spinnerRecipe, textarea: textareaRecipe,
    },
    slotRecipes: {
      card: cardSlotRecipe, dialog: dialogSlotRecipe, drawer: drawerSlotRecipe,
      field: fieldSlotRecipe, fieldset: fieldsetSlotRecipe, fileUpload: fileUploadSlotRecipe,
      menu: menuSlotRecipe, nativeSelect: nativeSelectSlotRecipe, select: selectSlotRecipe,
      switch: switchSlotRecipe, table: tableSlotRecipe, tabs: tabsSlotRecipe,
      toast: toastSlotRecipe, tooltip: tooltipSlotRecipe,
    },
  },
}
