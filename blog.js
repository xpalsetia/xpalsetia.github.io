(async () => {
    const indexRes = await fetch("posts/index.json");
    if (!indexRes.ok) {
      console.error("Could not load posts/index.json");
      return;
    }
    const fileList = await indexRes.json(); 
    
    const posts = [];
    for (let filename of fileList) {
      try {
        const postRes = await fetch(`posts/${filename}`);
        if (!postRes.ok) continue;
        const data = await postRes.json();

        if (data.id && data.title && data.date) {
          posts.push(data);
        }
      } catch (e) {
        console.warn("Failed to load", filename, e);
      }
    }
  
    //Sort posts by date descending (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
    //Extract all unique categories
    const categorySet = new Set();
    posts.forEach(p => {
      if (Array.isArray(p.categories)) {
        p.categories.forEach(cat => categorySet.add(cat));
      }
    });
    const categories = Array.from(categorySet).sort();
  
    //Render category checkboxes
    const checkboxContainer = document.getElementById("category-checkboxes");
    categories.forEach((cat) => {
      const wrapper = document.createElement("label");
      wrapper.style.marginRight = "1rem";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = cat;
      cb.name = "categoryFilter";
      cb.onchange = renderPostList; // re-render when filters change
      wrapper.appendChild(cb);
      wrapper.appendChild(document.createTextNode(" " + cat));
      checkboxContainer.appendChild(wrapper);
    });
  
    //Render post list initially
    renderPostList();
  
    //Function to render posts filtered by selected categories ────
    function renderPostList() {
      const selected = new Set(
        Array.from(document.querySelectorAll('input[name="categoryFilter"]:checked'))
          .map(cb => cb.value)
      );
  
      const listSection = document.getElementById("posts-list");
      listSection.innerHTML = ""; // clear out old content
  
      posts.forEach(post => {
        // If any filters are checked, skip posts that don't have at least one selected category
        if (selected.size > 0) {
          const hasMatch = post.categories?.some(cat => selected.has(cat));
          if (!hasMatch) return;
        }
  
        // Build a preview card:
        const card = document.createElement("article");
        card.className = "post-preview";
        const titleLink = document.createElement("a");
        titleLink.href = `post.html?id=${encodeURIComponent(post.id)}`;
        titleLink.textContent = post.title;
        titleLink.className = "post-title";
  
        const dateEl = document.createElement("time");
        dateEl.dateTime = post.date;
        dateEl.textContent = new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
        dateEl.className = "post-date";
  
        // Use thumbnail field instead of first image from images array
        let thumbImg = null;
        if (post.thumbnail) {
          thumbImg = document.createElement("img");
          thumbImg.src = post.thumbnail;
          thumbImg.alt = post.title + " thumbnail";
          thumbImg.className = "post-thumb";
        }
  
        // Optional excerpt: if you want, you can store an 'excerpt' field in JSON.
        const excerpt = document.createElement("p");
        excerpt.className = "post-excerpt";
        // We'll take first 150 chars of content (stripping tags):
        const temp = document.createElement("div");
        temp.innerHTML = post.content || "";
        const textOnly = temp.textContent || temp.innerText || "";
        excerpt.textContent = textOnly.slice(0, 150) + (textOnly.length > 150 ? "…" : "");
  
        // Assemble:
        if (thumbImg) card.appendChild(thumbImg);
        card.appendChild(titleLink);
        card.appendChild(dateEl);
        card.appendChild(excerpt);
  
        listSection.appendChild(card);
      });
  
      // If no posts matched:
      if (listSection.children.length === 0) {
        const msg = document.createElement("p");
        msg.textContent = "No posts found for selected category.";
        listSection.appendChild(msg);
      }
    }
  })();