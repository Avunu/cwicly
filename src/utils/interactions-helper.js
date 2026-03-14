/**
 * Semantic replacement for interactions helper.
 */
export function getInteractions(attributes) {
  if (attributes.interactions) {
    const interactionsJson = JSON.stringify(attributes.interactions);
    const emptyInteractions = [
      '{"click":[],"dbclick":[],"scrollinview":[]}',
      '{"dbclick":[],"scrollinview":[]}'
    ];
    if (!emptyInteractions.includes(interactionsJson)) {
      return {
        "data-interaction": interactionsJson
      };
    }
  }
  return null;
}
