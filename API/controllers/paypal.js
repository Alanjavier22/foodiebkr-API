//Dependencias
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// constantes
import ventas from "./ventas.js";
import oferta from "./oferta.js";

const accessToken = `${process.env.clientID}:${process.env.clientSecret}`;

export default function (sentences) {
  const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const loadItems = (datosCarrito, iva_value) => {
    return datosCarrito.map((item) => {
      const iva = Number(item.total * (iva_value / 100)).toFixed(2);
      const ivaPorUnidad = (Number(iva) / item.cantidad).toFixed(2);

      return {
        name: item.nombre,
        description: item.seccion || "cursos",
        quantity: item.cantidad.toString(),
        tax: { currency_code: "USD", value: ivaPorUnidad },
        unit_amount: {
          currency_code: "USD",
          value: Number(item.total / item.cantidad).toFixed(2),
        },
      };
    });
  };

  const loadData = (cartData) => {
    if (cartData) {
      const { cartDetails, dataCar } = cartData;

      const order = [
        {
          reference_id: generateRandomNumber(1, 1000),
          description: `Compra desde la tienda de Foodie Baker`,
          amount: {
            currency_code: "USD",
            value: Number(dataCar.total).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: Number(dataCar.subtotal).toFixed(2),
              },
              tax_total: {
                currency_code: "USD",
                value: Number(dataCar.totalIva).toFixed(2),
              },
              discount: {
                currency_code: "USD",
                value: Number(dataCar.totalDesc).toFixed(2),
              },
            },
          },
          items: loadItems(cartDetails, dataCar.iva),
        },
      ];

      return order;
    }
  };

  async function createOrder(data, token) {
    try {
      const bodyData = {
        intent: "CAPTURE",
        purchase_units: loadData(data),
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "Foddie Baker",
              landing_page: "LOGIN",
              user_action: "PAY_NOW",
              return_url: "http://localhost:3006/carrito",
            },
          },
        },
      };

      const orderData = await fetch(
        "https://api.sandbox.paypal.com/v2/checkout/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa(accessToken),
          },
          body: JSON.stringify(bodyData),
        }
      ).then((response) => response.json());

      if (!orderData.id) {
        throw new Error("Unexpected error occurred, please try again.");
      }

      if (orderData.status === "PAYER_ACTION_REQUIRED") {
        await fetch(
          `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`,
          {
            method: "GET",
            headers: { Authorization: "Basic " + btoa(accessToken) },
          }
        );
      }

      return orderData;
    } catch (err) {
      throw new Error(err);
    }
  }

  async function captureOrder(data, token) {
    const { orderID, datosCliente, codigo_descuento } = data;

    try {
      await fetch(
        `https://api.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa(accessToken),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderID }),
        }
      );
    } catch (err) {
      console.log(err);
    }

    try {
      const orderData = await checkoutOrder({ orderID });

      await ventas(sentences).insertFromStore(orderData, datosCliente, token);
      await oferta(sentences).actualizarOfertaCliente(codigo_descuento, token);

      const { payer } = orderData;

      return {
        data: orderData,
        mensaje: `Transaction completed by ${payer.name.given_name}`,
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  async function checkoutOrder({ orderID }) {
    try {
      return await fetch(
        `https://api.sandbox.paypal.com/v2/checkout/orders/${orderID}`,
        {
          method: "GET",
          headers: {
            Authorization: "Basic " + btoa(accessToken),
          },
        }
      ).then((response) => response.json());
    } catch (err) {
      throw new Error(err);
    }
  }

  return {
    //GET
    //POST
    createOrder,
    captureOrder,
    checkoutOrder,
  };
}
