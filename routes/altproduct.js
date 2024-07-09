try {
    if(req.files && req.files.length > 0 && validate){
  
    const displayPicture = req.files[0];
    const { name, description, price, category, quantity } = req.body;
    const owner = await User.findByPk(req.user.id);
    if (!owner) return res.status(400).json({ error: "Owner not found" });

    const ownerid = req.user.id;
    const fs = require('fs');
    const path = `uploads/${displayPicture.originalname}`;
    fs.writeFileSync(path, displayPicture.buffer);

    const product = await Product.create({
      name,
      description,
      price,
      category,
      quantity,
      displayPicture:path,
      ownerid,
    });
    return res.status(201).json(product);
    }else{
      return res.status(400).json({error:"File not uploaded"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Error creating product" });
  }
});