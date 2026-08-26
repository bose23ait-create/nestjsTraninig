export const welcomeTemplate = (name: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome, ${name}!</h1>

        <p>
          Thank you for registering with our application.
        </p>

        <p>
          We are happy to have you with us.
        </p>

        <p>
          Regards,<br>
          My Application Team
        </p>
      </body>
    </html>
  `;
};
export interface ProductEmailData {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
}

export const productCreatedTemplate = (
  adminName: string,
  product: ProductEmailData,
) => {
  const imageList = product.images
    .map(
      (image, index) => `
        <div style="
          margin-bottom: 15px;
          padding: 14px;
          background-color: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        ">

          <div style="
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 6px;
          ">
            Product Image ${index + 1}
          </div>

          <div style="
            font-size: 14px;
            color: #374151;
            word-break: break-all;
          ">
            ${image}
          </div>

        </div>
      `,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>Product Created</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
        font-family: Arial, Helvetica, sans-serif;
      ">

        <div style="
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        ">

          <!-- Header -->

          <div style="
            background-color: #2563eb;
            padding: 30px 20px;
            text-align: center;
            color: #ffffff;
          ">

            <h1 style="
              margin: 0;
              font-size: 26px;
            ">
              Product Created Successfully
            </h1>

            <p style="
              margin: 10px 0 0;
              font-size: 14px;
              opacity: 0.9;
            ">
              Your product has been added to the store
            </p>

          </div>


          <!-- Content -->

          <div style="padding: 30px;">

            <p style="
              margin: 0 0 15px;
              color: #374151;
              font-size: 16px;
            ">
              Hello <strong>${adminName}</strong>,
            </p>

            <p style="
              margin: 0 0 25px;
              color: #6b7280;
              font-size: 15px;
              line-height: 1.6;
            ">
              Your product has been successfully created.
              Here are the product details:
            </p>


            <!-- Product Details -->

            <div style="
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              padding: 24px;
            ">

              <h2 style="
                margin: 0 0 15px;
                color: #111827;
                font-size: 22px;
              ">
                ${product.name}
              </h2>

              <p style="
                margin: 0 0 20px;
                color: #4b5563;
                font-size: 15px;
                line-height: 1.6;
              ">
                ${product.description}
              </p>


              <!-- Price -->

              <div style="
                padding: 12px 0;
                border-top: 1px solid #e5e7eb;
              ">

                <span style="color: #6b7280;">
                  Price
                </span>

                <strong style="
                  float: right;
                  color: #16a34a;
                ">
                  ₹${product.price}
                </strong>

              </div>


              <!-- Stock -->

              <div style="
                padding: 12px 0;
                border-top: 1px solid #e5e7eb;
              ">

                <span style="color: #6b7280;">
                  Stock
                </span>

                <strong style="
                  float: right;
                  color: #111827;
                ">
                  ${product.stock}
                </strong>

              </div>

            </div>

            <!-- Attached Images -->

            <div style="margin-top: 25px;">
              <h3 style="color: #111827;">Attached product images</h3>
              ${imageList}
            </div>

            <!-- Success -->

            <div style="
              margin-top: 25px;
              padding: 16px;
              background-color: #f0fdf4;
              border-left: 4px solid #16a34a;
              color: #166534;
              font-size: 14px;
              border-radius: 4px;
            ">

              ✓ Your product is now available in your store.

            </div>


            <!-- Regards -->

            <p style="
              margin: 30px 0 0;
              color: #4b5563;
              font-size: 15px;
              line-height: 1.6;
            ">
              Regards,<br />

              <strong>
                My Application Team
              </strong>
            </p>

          </div>


          <!-- Footer -->

          <div style="
            padding: 20px;
            text-align: center;
            background-color: #f9fafb;
            color: #9ca3af;
            font-size: 12px;
          ">

            <p style="margin: 0;">
              © 2026 My Application. All rights reserved.
            </p>

            <p style="
              margin: 8px 0 0;
            ">
              This is an automated email. Please do not reply.
            </p>

          </div>

        </div>

      </body>
    </html>
  `;
};

export interface OrderEmailData {
  orderId: string;
  total: number;
  status: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const renderOrderItems = (items: OrderEmailData['items']) => {
  return items
    .map(
      (item) => `
    <div style="padding: 12px 0; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
      <span style="color: #4b5563;">${item.name} (x${item.quantity})</span>
      <strong style="color: #111827;">₹${(item.price * item.quantity).toFixed(2)}</strong>
    </div>
  `,
    )
    .join('');
};

export const orderCreatedTemplate = (name: string, order: OrderEmailData) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background-color: #2563eb; padding: 30px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">Thank you for your purchase.</p>
          </div>
          <div style="padding: 30px;">
            <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="margin: 0 0 25px; color: #6b7280; font-size: 15px; line-height: 1.6;">
              We've received your order <strong>#${order.orderId}</strong> and it is now <strong>${order.status}</strong>.
            </p>
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px;">
              <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px;">Order Summary</h2>
              ${renderOrderItems(order.items)}
              <div style="padding: 16px 0 0; border-top: 2px solid #e5e7eb; margin-top: 8px;">
                <span style="color: #111827; font-weight: bold; font-size: 18px;">Total</span>
                <strong style="float: right; color: #16a34a; font-size: 18px;">₹${order.total.toFixed(2)}</strong>
              </div>
            </div>
            <div style="margin-top: 25px;">
              <h3 style="color: #111827; font-size: 16px;">Shipping Details</h3>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
                ${order.customerDetails.name}<br/>
                ${order.customerDetails.address}<br/>
                ${order.customerDetails.city}, ${order.customerDetails.state} ${order.customerDetails.postalCode}<br/>
                Phone: ${order.customerDetails.phone}
              </p>
            </div>
            <p style="margin: 30px 0 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
              Regards,<br /><strong>My Application Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const orderStatusUpdateTemplate = (
  name: string,
  order: OrderEmailData,
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Status Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background-color: #2563eb; padding: 30px 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px;">Order Status Update</h1>
            <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.9;">There is an update on your order #${order.orderId}</p>
          </div>
          <div style="padding: 30px;">
            <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="margin: 0 0 25px; color: #6b7280; font-size: 15px; line-height: 1.6;">
              Your order status has been updated to: <strong style="color: #16a34a; font-size: 18px; text-transform: uppercase;">${order.status}</strong>
              ${order.status === 'cancelled' ? '<br/><br/><strong>Refund Processed:</strong> A full refund of ₹' + order.total.toFixed(2) + ' has been initiated to your original payment method. Please allow a few business days for the amount to reflect in your account.' : ''}
            </p>
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px;">
              <h2 style="margin: 0 0 15px; color: #111827; font-size: 20px;">Order Summary</h2>
              ${renderOrderItems(order.items)}
              <div style="padding: 16px 0 0; border-top: 2px solid #e5e7eb; margin-top: 8px;">
                <span style="color: #111827; font-weight: bold; font-size: 18px;">Total</span>
                <strong style="float: right; color: #16a34a; font-size: 18px;">₹${order.total.toFixed(2)}</strong>
              </div>
            </div>
            <p style="margin: 30px 0 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
              Regards,<br /><strong>My Application Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};
