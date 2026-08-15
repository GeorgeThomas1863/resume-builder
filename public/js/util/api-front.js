export const sendToBack = async (inputParams, method = "POST", raw = false) => {
  const { route } = inputParams;

  try {
    const params = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (method !== "GET" && method !== "HEAD") {
      params.body = JSON.stringify(inputParams);
    }

    const res = await fetch(route, params);
    if (!res.ok) return null;
    if (raw) return res;

    //otherwise return json
    const data = await res.json();

    return data;
  } catch (e) {
    // console.log(e);
    return "FAIL";
  }
};

// export const sendToBack = async (inputParams) => {
//   const { route } = inputParams;

//   //send all to backend
//   try {
//     const res = await fetch(route, {
//       method: "POST",
//       body: JSON.stringify(inputParams),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await res.json();
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const sendToBackGET = async (inputParams) => {
//   const { route } = inputParams;

//   try {
//     const res = await fetch(route, {
//       method: "GET",
//     });

//     const data = await res.json();
//     return data;
//   } catch (error) {
//     console.log(error);
//   }
// };
