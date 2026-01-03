export const sendToBack = async (inputParams, method = "POST") => {
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
    const data = await res.json();

    return data;
  } catch (error) {
    console.log(error);
    return "FAIL";
  }
};

export const sendToBackFile = async (inputParams) => {
  const { route } = inputParams;

  //send all to backend
  try {
    const res = await fetch(route, {
      method: "POST",
      body: JSON.stringify(inputParams),
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("RES");
    console.log(res);

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "new-resume.docx";
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();

    return true;
  } catch (e) {
    console.log(e);
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
