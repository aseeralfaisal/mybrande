const logoFile = localStorage.getItem('saved_logo');

if (logoFile) {
  const imgElement = document.getElementById('logo-file');
  imgElement.src = logoFile;
}

const tagName = document.getElementById('tag_name');
const tagList = document.getElementById('tag_list');
let tagItems = ['Plane', 'Shape', 'Geometric'];

tagName.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    let val = tagName.value;
    if (val !== '') {
      if (tagItems.indexOf(val) >= 0) {
        alert('Tag name is a duplicate');
      } else {
        tagItems.push(val);
        render();
        tagName.value = '';
        tagName.focus();
      }
    } else {
      alert('No tag Name!!!');
    }
  }
});

const render = () => {
  tagList.innerHTML = '';
  tagItems.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<span class="tag_name_text">${item}</span><a id="item_${index}">X</a>`;

    const anchor = listItem.querySelector(`#item_${index}`);
    anchor.addEventListener('click', () => {
      deleteItem(index);
    });

    tagList.appendChild(listItem);
  });
};

const deleteItem = (index) => {
  tagItems = tagItems.filter((i, idx) => idx !== index);
  render();
};

render();

const categoryData = [
  {
    category: 'Technology Industry',
    types: [
      'Software Development',
      'Hardware Manufacturing',
      'Information Technology Services',
      'Artificial Intelligence',
      'Cybersecurity',
    ],
  },
  {
    category: 'Healthcare Industry',
    types: [
      'Hospitals and Healthcare Providers',
      'Pharmaceutical Manufacturing',
      'Biotechnology',
      'Medical Devices',
      'Health Insurance',
    ],
  },
  {
    category: 'Finance Industry',
    types: ['Banking', 'Investment Management', 'Insurance', 'Real Estate', 'Fintech'],
  },
  {
    category: 'Energy Industry',
    types: [
      'Oil and Gas Exploration',
      'Renewable Energy',
      'Electric Utilities',
      'Energy Storage',
      'Nuclear Power',
    ],
  },
  {
    category: 'Entertainment Industry',
    types: ['Film and Television Production', 'Music', 'Video Games', 'Streaming Services', 'Live Events'],
  },
  {
    category: 'Automotive Industry',
    types: [
      'Automobile Manufacturing',
      'Automotive Parts and Accessories',
      'Electric Vehicles',
      'Autonomous Vehicles',
      'Transportation Services',
    ],
  },
  {
    category: 'Retail Industry',
    types: [
      'E-commerce',
      'Brick-and-Mortar Retail',
      'Fashion and Apparel',
      'Consumer Electronics',
      'Grocery and Supermarkets',
    ],
  },
  {
    category: 'Aerospace and Defense Industry',
    types: [
      'Aircraft Manufacturing',
      'Defense Contracting',
      'Space Exploration',
      'Aerospace Technology',
      'Military Equipment',
    ],
  },
  {
    category: 'Food and Beverage Industry',
    types: [
      'Food Processing',
      'Beverages (Non-alcoholic and Alcoholic)',
      'Restaurants and Fast Food',
      'Agriculture',
      'Food Distribution',
    ],
  },
  {
    category: 'Environmental Industry',
    types: [
      'Environmental Consulting',
      'Waste Management',
      'Renewable Resource Management',
      'Pollution Control',
      'Green Building and Sustainability',
    ],
  },
];

const categoryTitle = document.getElementById('category_title');
const categoryTypes = document.getElementById('category_types');

categoryData.map((data) => {
  const categoryTitleList = document.createElement('li');
  categoryTitleList.className = 'cat_list';
  categoryTitleList.append(data.category);
  categoryTitle.append(categoryTitleList);
});

categoryTitle.addEventListener('click', (event) => {
  categoryTypes.innerHTML = '';
  const category = event.target.innerText;
  const filtered = categoryData.filter((item) => item.category.includes(category));
  const filteredTypes = filtered[0].types;

  filteredTypes.map((i) => {
    const categoryTypeList = document.createElement('li');
    categoryTypeList.classList.add('cat_list');
    categoryTypeList.append(i);
    categoryTypes.append(categoryTypeList);
  });
});

let businessType = document.getElementById('business_type');
let businessTypeList = document.getElementById('business_type_list');
let newTypes = [];

const modal_business_tags_parent = document.querySelector('#modal_business_tags_parent');
const modal_business_tags = document.querySelector('#modal_business_tags');

const businessTypeRender = () => {
  businessTypeList.innerHTML = '';
  newTypes.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `<span class="tag_name_text">${item}</span><a id="item_${index}">X</a>`;
    businessTypeList.appendChild(listItem);
    console.log(modal_business_tags.cloneNode(true).innerHTML);
    modal_business_tags_parent.innerHTML = modal_business_tags.cloneNode(true).innerHTML;

    const anchor = listItem.querySelector(`#item_${index}`);
    anchor.addEventListener('click', () => {
      businessTypeDelete(item);
    });
  });
};

const businessTypeDelete = (item) => {
  newTypes = newTypes.filter((i) => !item.includes(i));
  businessTypeRender();
};

document.addEventListener('DOMContentLoaded', () => {
  businessTypeRender();
});

categoryTypes.addEventListener('click', (e) => {
  const category = e.target.innerText;
  const categoryName = category.split(' ')[0];

  if (newTypes.includes(categoryName)) {
    businessTypeDelete(categoryName);
  } else {
    newTypes.push(categoryName);
    businessTypeRender();
  }
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('industry-modal')) {
    document.querySelector('#industry-modal').style.display = 'none';
  }
});

const toggleIndustryModal = () => (document.querySelector('#industry-modal').style.display = 'block');

document.getElementById('modal_business_tags_parent').addEventListener('click', toggleIndustryModal);
document.getElementById('industry-type').addEventListener('click', toggleIndustryModal);

const newLogoType = [];
const newLogoStyle = [];

const logostyle = ['3D', 'Vintage', 'Water Color', 'Minimalist', 'Geometric', 'Hand-Drawn', 'Cartoon'];

const logotype = ['Monogram', 'Mascot', 'Emblem', 'Abstract', 'Pictorial'];

logotype.forEach((logo) => {
  const div = document.createElement('div');
  div.innerText = logo;
  div.className = 'round__chip';
  div.setAttribute('id', 'logotype');
  document.getElementById('logo-type').append(div);
});

logostyle.forEach((logo) => {
  const div = document.createElement('div');
  div.innerText = logo;
  div.className = 'round__chip';
  div.setAttribute('id', 'logostyle');
  document.getElementById('logo-style').append(div);
});

document.querySelectorAll('#logotype').forEach((item) => {
  if (newLogoType.includes(item.innerText)) {
    item.style.background = '#000';
  } else {
    item.style.background = '';
  }
});

document.querySelectorAll('#logostyle').forEach((item) => {
  if (newLogoStyle.includes(item.innerText)) {
    item.style.background = '#000';
  } else {
    item.style.background = '';
  }
});

document.getElementById('logo-type').addEventListener('click', (e) => {
  const type = e.target.innerText;
  if (!newLogoType.includes(type)) {
    newLogoType.push(type);
  } else {
    newLogoType.splice(newLogoType.indexOf(type), 1);
  }
  document.querySelectorAll('#logotype').forEach((item) => {
    if (newLogoType.includes(item.innerText)) {
      item.style.background = '#000';
    } else {
      item.style.background = '';
    }
  });
});

document.getElementById('logo-style').addEventListener('click', (e) => {
  const type = e.target.innerText;
  if (!newLogoStyle.includes(type)) {
    newLogoStyle.push(type);
  } else {
    newLogoStyle.splice(newLogoStyle.indexOf(type), 1);
  }
  document.querySelectorAll('#logostyle').forEach((item) => {
    if (newLogoStyle.includes(item.innerText)) {
      item.style.background = '#000';
    } else {
      item.style.background = '';
    }
  });
});
