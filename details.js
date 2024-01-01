import axios from 'axios';
import Toastify from 'toastify-js';

const toastNotification = (text) => {
  return Toastify({
    text,
    duration: 3000,
    newWindow: true,
    close: false,
    gravity: 'top',
    position: 'center',
    stopOnFocus: true,
    style: {
      background: 'var(--gold)',
      color: '#ffffff',
      borderRadius: '8px',
      cursor: 'context-menu',
    },
    onClick: null,
  }).showToast();
};

const tagName = document.getElementById('tag_name');
const tagList = document.getElementById('tag_list');
let tagItems = [];

tagName.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    document.querySelector('#tag_list_wrapper').style.display = 'block';
    let val = tagName.value;

    const graphicTagLen = getGraphicTaglist().length;
    if (graphicTagLen >= 20) {
      return toastNotification('20 graphic elements are allowed at max');
    }

    if (val !== '') {
      if (tagItems.indexOf(val) >= 0) {
        toastNotification('Tag name is a duplicate');
      } else {
        tagItems.push(val);
        tagNamesRender();
        tagName.value = '';
        tagName.focus();
      }
    } else {
      toastNotification('No tag Name!!!');
    }
  }
});

const tagNamesRender = () => {
  if (tagItems.length === 0) document.querySelector('#tag_list_wrapper').style.display = 'none';
  tagList.innerHTML = '';
  tagItems.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.style.width = 'max-content';
    listItem.innerHTML = `<span id="gfx_elem_text" class="tag_name_text">${item}</span><a id="item_${index}">X</a>`;

    const anchor = listItem.querySelector(`#item_${index}`);
    anchor.addEventListener('click', () => {
      deleteItem(index);
    });

    tagList.appendChild(listItem);
  });
};

const deleteItem = (index) => {
  tagItems = tagItems.filter((i, idx) => idx !== index);
  tagNamesRender();
};

tagNamesRender();

const savedImg = localStorage.getItem('saved_logo');

document.querySelector('#prev_img').src = savedImg;

// const categoryData = [
//   {
//     category: 'Technology Industry',
//     types: [
//       'Software Development',
//       'Hardware Manufacturing',
//       'Information Technology Services',
//       'Artificial Intelligence',
//       'Cybersecurity',
//     ],
//   },
//   {
//     category: 'Healthcare Industry',
//     types: [
//       'Hospitals and Healthcare Providers',
//       'Pharmaceutical Manufacturing',
//       'Biotechnology',
//       'Medical Devices',
//       'Health Insurance',
//     ],
//   },
//   {
//     category: 'Finance Industry',
//     types: ['Banking', 'Investment Management', 'Insurance', 'Real Estate', 'Fintech'],
//   },
//   {
//     category: 'Energy Industry',
//     types: [
//       'Oil and Gas Exploration',
//       'Renewable Energy',
//       'Electric Utilities',
//       'Energy Storage',
//       'Nuclear Power',
//     ],
//   },
//   {
//     category: 'Entertainment Industry',
//     types: ['Film and Television Production', 'Music', 'Video Games', 'Streaming Services', 'Live Events'],
//   },
//   {
//     category: 'Automotive Industry',
//     types: [
//       'Automobile Manufacturing',
//       'Automotive Parts and Accessories',
//       'Electric Vehicles',
//       'Autonomous Vehicles',
//       'Transportation Services',
//     ],
//   },
//   {
//     category: 'Retail Industry',
//     types: [
//       'E-commerce',
//       'Brick-and-Mortar Retail',
//       'Fashion and Apparel',
//       'Consumer Electronics',
//       'Grocery and Supermarkets',
//     ],
//   },
//   {
//     category: 'Aerospace and Defense Industry',
//     types: [
//       'Aircraft Manufacturing',
//       'Defense Contracting',
//       'Space Exploration',
//       'Aerospace Technology',
//       'Military Equipment',
//     ],
//   },
//   {
//     category: 'Food and Beverage Industry',
//     types: [
//       'Food Processing',
//       'Beverages (Non-alcoholic and Alcoholic)',
//       'Restaurants and Fast Food',
//       'Agriculture',
//       'Food Distribution',
//     ],
//   },
//   {
//     category: 'Environmental Industry',
//     types: [
//       'Environmental Consulting',
//       'Waste Management',
//       'Renewable Resource Management',
//       'Pollution Control',
//       'Green Building and Sustainability',
//     ],
//   },
// ];

const getIndustryData = async () => {
  try {
    const response = await axios.get('https://www.mybrande.com/api/get/industry');
    const newCategoryData = response.data.CategoryAndSubcategories;
    return newCategoryData;
  } catch (error) {
    console.log(error);
  }
};

getIndustryData().then((newCategoryData) => {
  const categoryTitle = document.getElementById('category_title');
  const categoryTypes = document.getElementById('category_types');

  newCategoryData?.map((data) => {
    const categoryTitleList = document.createElement('li');
    categoryTitleList.className = 'cat_list';
    categoryTitleList.append(data.category.industry_category_name);
    categoryTitle.append(categoryTitleList);
  });

  categoryTitle.addEventListener('click', (event) => {
    const category = event.target.innerText;
    const categoryExists = newCategoryData.find((i) => i.category.industry_category_name === category);
    if (categoryExists) {
      document.querySelector('#category_types').innerHTML = '';
      categoryExists.subcategories.forEach((i) => {
        const categoryTypeList = document.createElement('li');
        categoryTypeList.classList.add('cat_list');
        const industrySubcategory = i.industry_subcategory_name;
        categoryTypeList.append(industrySubcategory);
        categoryTypes.append(categoryTypeList);
      });
    }
  });

  let businessTypeList = document.getElementById('business_type_list');
  let newTypes = [];

  const modal_business_tags_parent = document.querySelector('#modal_business_tags_parent');
  const modal_business_tags = document.querySelector('#modal_business_tags');

  const businessTypeRender = () => {
    document.querySelector('#business_text_color').style.display = 'none';
    businessTypeList.innerHTML = '';
    newTypes.forEach((item, index) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<span id="industry_elem_text" class="tag_name_text">${item}</span><a id="item_${index}">X</a>`;
      businessTypeList.appendChild(listItem);
      modal_business_tags_parent.innerHTML = modal_business_tags.cloneNode(true).innerHTML;

      const anchor = listItem.querySelector(`#item_${index}`);
      anchor.addEventListener('click', () => {
        businessTypeDelete(item);
      });
    });
  };

  const businessTypeDelete = (item) => {
    newTypes = newTypes.filter((i) => !item.includes(i));
    if (newTypes.length === 0) {
      modal_business_tags_parent.innerHTML = '';
    }
    businessTypeRender();
  };

  document.addEventListener('DOMContentLoaded', () => {
    businessTypeRender();
  });

  categoryTypes.addEventListener('click', (e) => {
    const category = e.target.innerText;
    const industryTagLen = getIndustrylist().length;

    if (industryTagLen >= 30) {
      return toastNotification('30 industry tags are allowed at max');
    }

    if (newTypes.includes(category)) {
      return toastNotification('The item already exist in the list');
    } else {
      newTypes.push(category);
      businessTypeRender();
    }
  });
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('industry-modal') || event.target.classList.contains('fa-close')) {
    document.querySelector('#industry-modal').style.display = 'none';
  }
});

const visibleIndustryModal = () => (document.querySelector('#industry-modal').style.display = 'block');

document.getElementById('modal_business_tags_parent').addEventListener('click', visibleIndustryModal);
document.getElementById('industry-type').addEventListener('click', visibleIndustryModal);

const newLogoType = [];
const newLogoStyle = [];

const logostyle = [
  '3D',
  'Vintage',
  'Water Color',
  'Minimalist',
  'Geometric',
  'Hand-Drawn',
  'Cartoon',
  'Mascot',
  'Emblem',
  'Abstract',
  'Pictorial',
  'Monogram',
];
// const logotype = ['Monogram', 'Mascot', 'Emblem', 'Abstract', 'Pictorial'];

// logotype.forEach((logo) => {
//   const div = document.createElement('div');
//   div.innerText = logo;
//   div.className = 'round__chip';
//   div.setAttribute('id', 'logotype');
//   document.getElementById('logo-type').append(div);
// });

logostyle.forEach((logo) => {
  const div = document.createElement('div');
  div.innerText = logo;
  div.className = 'round__chip';
  div.setAttribute('id', 'logostyle');
  document.getElementById('logo-style').append(div);
});

document.querySelectorAll('#logostyle').forEach((item) => {
  if (newLogoStyle.includes(item.innerText)) {
    item.style.background = '#000';
  } else {
    item.style.background = '';
  }
});

for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
  const item = String.fromCharCode(i);
  document.querySelector('#monogram_list').innerHTML += `<span id="mlist_item" class="mlist">${item}</span>`;
}

document.getElementById('logo-style').addEventListener('click', (e) => {
  const item = e.target.innerText;

  if (item === 'Monogram') {
    const monoList = document.querySelector('#monogram_list');
    monoList.style.display = monoList.style.display === 'grid' ? 'none' : 'grid';
  } else {
    if (!newLogoStyle.includes(item)) {
      newLogoStyle.push(item);
    } else {
      newLogoStyle.splice(newLogoStyle.indexOf(item), 1);
    }
  }

  document.querySelectorAll('#logostyle').forEach((item) => {
    if (newLogoStyle.includes(item.innerText) && item.innerText !== 'Monogram') {
      item.style.background = 'var(--gold)';
    } else {
      item.style.background = '';
    }
  });
});

document.querySelectorAll('#mlist_item').forEach((item) => {
  item.addEventListener('click', (e) => {
    const item = e.target.innerText;

    if (item.length === 1 && item >= 'a' && item <= 'z') {
      newLogoType.push(item);
    } else if (!newLogoStyle.includes(item)) {
      newLogoStyle.push(item);
    } else {
      newLogoStyle.splice(newLogoStyle.indexOf(item), 1);
    }

    if (newLogoStyle.includes(item)) {
      item.style.background = 'var(--gold)';
    } else {
      item.style.background = '';
    }
  });
});

const getGraphicTaglist = () => {
  const taglist = [];
  const tags = document.querySelectorAll('#gfx_elem_text');
  tags.forEach((tag) => taglist.push(tag.innerHTML));
  return taglist;
};

const getIndustrylist = () => {
  const industry = document.querySelectorAll('#industry_elem_text');
  const industrylist = [];
  industry.forEach((tag) => industrylist.push(tag.innerHTML));
  return industrylist;
};

const publishLogoBtn = document.getElementById('upload_logo');

const logoPublisher = async () => {
  const graphicTagLen = getGraphicTaglist().length;
  const industryTagLen = getIndustrylist().length;
  const logoStyleTagLen = newLogoStyle.length;

  const fieldsAreEmpty = logoStyleTagLen === 0 || graphicTagLen === 0 || industryTagLen === 0;

  if (fieldsAreEmpty) {
    return toastNotification('All the fields are required');
  } else if (graphicTagLen >= 20) {
    return toastNotification('20 graphic elements are allowed at max');
  } else if (industryTagLen >= 30) {
    return toastNotification('30 industry tags are allowed at max');
  }

  const graphical_element = getGraphicTaglist().join(',');
  const industry = getIndustrylist().join(',');
  const monogram_type = newLogoType.join(',');
  const logo_style = newLogoStyle.join(',');
  const seller_logoinfo_id = localStorage.getItem('sellerLogoInfoId');

  const postData = {
    seller_logoinfo_id,
    graphical_element,
    industry,
    monogram_type,
    logo_style,
  };

  const response = await axios.post('https://www.mybrande.com/api/logoothersinfo/store', postData);

  if (response.status === 200) {
    const userName = document.getElementById('logo_name_input-userName').value;
    location.href = `https://www.mybrande.com/${userName}`;
  }
};

publishLogoBtn.addEventListener('click', logoPublisher);
