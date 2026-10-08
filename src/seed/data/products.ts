export interface ProductSeed {
  name: string;
  price: number;
  quantity: number;
  category: string;
  status: string;
  image: string;
}

export const products: ProductSeed[] = [
  {
    name: "Product 1",
    price: 10.99,
    quantity: 100,
    category: "Category 1",
    status: "active",
    image: "product1.jpg"
  },
  {
    name: "Product 2",
    price: 19.99,
    quantity: 50,
    category: "Category 2",
    status: "active",
    image: "product2.jpg"
  },
  {
    name: "Product 3",
    price: 5.99,
    quantity: 200,
    category: "Category 3",
    status: "active",
    image: "product3.jpg"
  },
  {
    name: "Product 4",
    price: 15.99,
    quantity: 75,
    category: "Category 4",
    status: "active",
    image: "product4.jpg"
  }
];
  
