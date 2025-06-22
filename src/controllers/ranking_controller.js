import PostModel from "../models/post_model.js";
import geolib from 'geolib';

export const getNearbyPosts = async (req, res) => {
    const { latitude, longitude, maxDistance = 5000 } = req.query;
    
    try {
        // 1. First try to find nearby posts
        const allPosts = await PostModel.find({ status: "live" });
        
        const postsWithDistance = allPosts.map(post => {
        const distance = geolib.getDistance(
                { latitude, longitude },
                { latitude: post.latitude, longitude: post.longitude }
            );
            return { ...post.toObject(), distance };
        }).filter(post => post.distance <= maxDistance);
        
        postsWithDistance.sort((a, b) => a.distance - b.distance);
        
        // Price boost tiers
        // const priceTiers = [
        //     { boost: 0.10, label: "10%" }, 
        //     { boost: 0.08, label: "8%" },   
        //     { boost: 0.07, label: "7%" },  
        //     { boost: 0.05, label: "5%" },   
        //     { boost: 0.02, label: "2%" }   
        // ];
        const priceTiers = [
                { boost: 0.10, label: "0%" },];
        
        // Apply price boosts
        const result = postsWithDistance.map((post, index) => {
            const tier = index < priceTiers.length ? priceTiers[index] : { boost: 0, label: "0%" };
            const adjustedPrice = post.price * (1 + tier.boost);
            
            return {
                ...post,
                originalPrice: post.price,
                adjustedPrice: Math.round(adjustedPrice * 100) / 100,
                priceBoost: tier.label,
                ranking: index + 1,
                tier: index < priceTiers.length ? index + 1 : null
            };
        });
        
        // Prepare tiered results
        let tieredResults = {
            premiumTiers: result.slice(0, 5),
            standard: result.slice(5),
            count: result.length
        };

        // 2. Fallback: If no posts found nearby, return random posts
        if (tieredResults.count === 0) {
            const randomPosts = await PostModel.aggregate([
                { $match: { status: "live" } },
                { $sample: { size: 10 } } // Get 10 random posts
            ]);
            
            if (randomPosts.length > 0) {
                tieredResults = {
                    premiumTiers: randomPosts.slice(0, 5).map((post, index) => ({
                        ...post,
                        distance: null, // Mark as not distance-based
                        originalPrice: post.price,
                        adjustedPrice: post.price, // No price boost
                        priceBoost: "0%",
                        ranking: index + 1,
                        tier: index + 1
                    })),
                    standard: randomPosts.slice(5).map(post => ({
                        ...post,
                        distance: null,
                        originalPrice: post.price,
                        adjustedPrice: post.price,
                        priceBoost: "0%",
                        ranking: null,
                        tier: null
                    })),
                    count: randomPosts.length,
                    fallback: true // Flag indicating these are random fallback results
                };
            }
        }
        
        res.status(200).json(tieredResults);
        
    } catch (error) {
        console.error("Error finding nearby posts:", error);
        res.status(500).json({ error: error.message });
    }
};


export const getPostByPincode = async (req, res) => {

        try {
          const pincode = req.params.pincode;
          
          // Search for posts with matching postalCode
          const posts = await PostModel.find({
            postalCode: pincode,
            status: "live",
          });
          
          if (posts.length === 0) {
            return res.status(404).json({ 
              message: 'No posts found for the given pincode' 
            });
          }
          
          res.json(posts);
        } catch (error) {
          console.error('Error searching by pincode:', error);
          res.status(500).json({ 
            error: 'An error occurred while searching by pincode' 
          });
        }
      }     


      export const getPostByAddress = async (req, res) => {
        try {
          const keyword = req.params.keyword;
      
          const posts = await PostModel.find({
            address: { $regex: keyword, $options: 'i' },
            status: "live", 
          });
      
          if (posts.length === 0) {
            return res.status(404).json({
              message: 'No live posts found for the given address keyword',
            });
          }
      
          res.json(posts);
        } catch (error) {
          console.error('Error searching live posts by address:', error);
          res.status(500).json({
            error: 'An error occurred while searching live posts by address',
          });
        }
      };
      
      