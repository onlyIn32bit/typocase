/// <reference path="../pb_data/types.d.ts" />

routerUse($apis.gzip());

routerAdd("get", "/{$}", (e) => {
    const html = $template
        .loadFiles(`${__hooks}/views/global.html`, `${__hooks}/views/components.html`, `${__hooks}/views/index.html`)
        .render({});

    return e.html(200, html);
});

routerAdd("get", "/login", (e) => {
    const html = $template
        .loadFiles(`${__hooks}/views/global.html`, `${__hooks}/views/components.html`, `${__hooks}/views/login.html`)
        .render({});

    if (e.auth) return e.redirect(302, "/");
    return e.html(200, html);
});

routerAdd("get", "/register", (e) => {
    const html = $template
        .loadFiles(`${__hooks}/views/global.html`, `${__hooks}/views/components.html`, `${__hooks}/views/register.html`)
        .render({});

    if (e.auth) return e.redirect(302, "/");
    return e.html(200, html);
});

routerAdd("get", "/product", (e) => {
    const record = $app.findRecordsByFilter(
        "products",
        "",
        "-updated",
        100,
        0,
        {}
    );

    const html = $template
        .loadFiles(`${__hooks}/views/global.html`, `${__hooks}/views/components.html`, `${__hooks}/views/product.html`)
        .render({ 
            products: record ? record.map((curr) => { return {
                id: curr?.get("id"),
                name: curr?.get("name"),
                description: curr?.get("description"),
                price: curr?.getInt("price").toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                imglink: curr?.getStringSlice("images")[0],
            } }) : []
        });

    return e.html(200, html);
});

routerAdd("get", "/product/{id}", (e) => {
    const id = e.request.pathValue("id");

    const record = $app.findRecordById("products", id);

    if (!record) {
        return e.json(404, { error: "Product not found." });
    }

    const html = $template
        .loadFiles(`${__hooks}/views/global.html`, `${__hooks}/views/components.html`, `${__hooks}/views/product_detail.html`)
        .render({ 
            product: record ? {
                id: id,
                name: record.get("name"),
                price: record.get("price"),
                description: record.get("description"),
            } : null
        });

    return e.html(200, html);
});

routerAdd("get", "/cart", (e) => {
    const record = $app.findRecordsByFilter(
        "carts",
        "user = {:user_id} && isOrdered = false",
        "-updated",
        100,
        0,
        { user_id: e.auth?.id },
        {}
    );

    const html = $template
        .loadFiles(`${__hooks}/views/global.html`, "", `${__hooks}/views/components.html`, `${__hooks}/views/cart.html`)
        .render({ carts: record });

    if (!e.auth) return e.redirect(302, "/login");
    return e.html(200, html);
});

routerAdd("get", "/user", (e) => {
    if (!e.auth) return e.redirect(302, "/login");

    const user = $app.findRecordById("users", e.auth.id);
    if (!user) {
        return e.json(404, { error: "User not found." });
    }

    const html = $template
        .loadFiles(`${__hooks}/views/global.html`, `${__hooks}/views/user.html`)
        .render({ user: user });

    return e.html(200, html);
});

routerAdd("post", "/api/cart", (e) => {
    const { productId, model, color } = e.requestInfo().body;

    if (!productId || !model || !color) {
        return e.json(400, { error: "Product ID and quantity are required." });
    }

    const product = $app.findRecordById("products", productId);
    if (!product) {
        return e.json(404, { error: "Product not found." });
    }

    const cartItem = $app.createRecord("carts", {
        user: e.auth?.id,
        product: productId,
        model: model,
        color: color,
        isOrdered: false
    });

    cartItem.save();

    return e.json(200, { message: "Item added to cart successfully." });
}, $apis.requireAuth());

//admin
routerAdd("get", "/admin/product", (e) => {
    const record = $app.findRecordsByFilter(
        "products",
        "",
        "-updated",
        100,
        0,
        {}
    );

    const html = $template
        .loadFiles(`${__hooks}/views/global.html`, `${__hooks}/views/admin/product.html`)
        .render({ 
            products: record ? record.map((curr) => { return {
                id: curr?.get("id"),
                name: curr?.get("name"),
                price: curr?.get("price"),
            } }) : []
        });

    return e.html(200, html);
}, $apis.requireAuth("admin"));

routerAdd("post", "/admin/product", (e) => {
    const { name, price } = e.requestInfo().body;

    if (!name || !price) {
        return e.json(400, { error: "Name and price are required." });
    }

    const product = $app.createRecord("products", {
        name: name,
        price: parseFloat(price)
    });

    product.save();

    return e.json(200, { message: "Product created successfully." });
}, $apis.requireAuth("admin")); 

routerAdd("delete", "/admin/product/{$}", (e) => {
    const productId = e.requestInfo().params.$;
    const product = $app.findRecordById("products", productId);
    if (!product) {
        return e.json(404, { error: "Product not found." });
    }
    product.delete();
    return e.json(200, { message: "Product deleted successfully." });
}
, $apis.requireAuth("admin"));
