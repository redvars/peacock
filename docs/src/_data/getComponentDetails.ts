import componentsDetails from './componentsDetails.json';

export function getComponentDetails(tagName: string): any {
  return componentsDetails.components.find((component: any) => component.tag === tagName);
}

const arr = componentsDetails.components.filter((component: any) => component.metadata.name).map((component: any) => component.tag);

export function getNextAndPrevious(target: string): {nextComponent?: any, previousComponent?: any} {
  const index = arr.indexOf(target);
  if (index === -1) {
    console.log(`"${target}" not found in the array.`);
    return {};
  }

  const nextIndex = (index + 1) % arr.length;
  const prevIndex = (index - 1 + arr.length) % arr.length;

  const nextElement = arr[nextIndex];
  const prevElement = arr[prevIndex];

  return {
    nextComponent: getComponentDetails(nextElement),
    previousComponent: getComponentDetails(prevElement),
  };
}

export function getCategoriesTree() {
  const categoriesTree: any[] = [];

  componentsDetails.components.forEach(component => {
    let categoryName = component.metadata.category;
    let subCategoryName = component.metadata.subcategory;
    if (!categoryName) {
      categoryName = 'Up coming';
    }

    let cat = categoriesTree.find((category: any) => category.name === categoryName);
    if (!cat) {
      cat = {
        name: categoryName,
        hide: false,
        children: [],
      };
      categoriesTree.push(cat);
    }

    if (subCategoryName) {
      let subCat = cat.children.find((subcategory: any) => subcategory.name === subCategoryName);
      if (!subCat) {
        subCat = {
          name: subCategoryName,
          children: [],
        };
        cat.children.push(subCat);
      }
      subCat.children.push(component.tag);
      return;
    }

    cat.children.push(component.tag);
  });

  const order = ['Data Display', 'Feedback', 'Form Inputs', 'General', 'Layout', 'Navigation', 'Charts', 'Others', 'Up coming'];

  categoriesTree.sort((a, b) => {
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  return categoriesTree;
}
