import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for translations
const TranslationContext = createContext();

// Tamil translations organized by component/page
const translations = {
  en: {
    // Default language - empty objects as we'll use the direct text for English
    common: {},
    navbar: {},
    footer: {},
    home: {},
    products: {},
    about: {},
    contact: {},
    cart: {},
    user: {}
  },
  ta: {
    common: {
      "Loading...": "ஏற்றுகிறது...",
      "Search": "தேடல்",
      "Submit": "சமர்ப்பிக்க",
      "Cancel": "ரத்து செய்",
      "Save": "சேமி",
      "Delete": "நீக்கு",
      "Edit": "திருத்து",
      "View": "பார்வை",
      "Close": "மூடு",
      "Back": "பின்னால்",
      "Next": "அடுத்து",
      "Previous": "முந்தைய",
      "Yes": "ஆம்",
      "No": "இல்லை",
      "Success": "வெற்றி",
      "Error": "பிழை",
      "Warning": "எச்சரிக்கை",
      "Info": "தகவல்",
      "Open": "திற",
      "menu": "பட்டி",
      "Close Menu": "பட்டியை மூடு",
      "current": "தற்போதைய"
    },
    navbar: {
      "Home": "முகப்பு",
      "Products": "தயாரிப்புகள்",
      "AI Recommendations": "AI பரிந்துரைகள்",
      "About": "எங்களை பற்றி",
      "Contact": "தொடர்பு",
      "Login": "உள்நுழைய",
      "Logout": "வெளியேறு",
      "My Profile": "என் சுயவிவரம்",
      "Shopping Cart": "பொருட்கூடை",
      "Select language": "மொழி தேர்ந்தெடுக்கவும்",
      "Language selection": "மொழி தேர்வு",
      "Surprise Me!": "ஆச்சரியப்படுத்து!",
      "User menu": "பயனர் பட்டி",
      "User": "பயனர்",
      "Cart": "கூடை",
    },
    footer: {
      "Providing high-quality cookwares for all your kitchen needs": "உங்கள் சமையலறை தேவைகளுக்காக உயர்தர சமையல் பாத்திரங்களை வழங்குதல்",
      "97, Agraharam Street, Erode": "97, அக்ரஹாரம் தெரு, ஈரோடு",
      "All rights reserved.": "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
      "Made with": "தரமான தயாரிப்புகளுக்காக",
      "K.Balaguruva Chettiar": "பாலகுருவா செட்டியார்",
      "for quality products.": "உடன் உருவாக்கப்பட்டது.",
      "Quick Links": "விரைவு இணைப்புகள்",
      "Connect With Us": "எங்களுடன் இணைக",
      "Newsletter": "செய்திமடல்",
      "Stay updated with our latest products and offers.": "எங்களின் சமீபத்திய தயாரிப்புகள் மற்றும் சலுகைகளைப் பற்றி தெரிந்துகொள்ளுங்கள்.",
      "Enter your email": "உங்கள் மின்னஞ்சலை உள்ளிடவும்",
      "Subscribe": "பதிவு செய்",
      "Subscribed successfully!": "வெற்றிகரமாக பதிவு செய்யப்பட்டது!",
      "Privacy Policy": "தனியுரிமைக் கொள்கை",
      "Terms of Service": "சேவை விதிமுறைகள்",
      "for quality yarns.": "தரமான நூல்களுக்காக.",
      "Products": "தயாரிப்புகள்",
      "About": "எங்களைப் பற்றி",
      "Contact": "தொடர்பு",
      "Blog": "வலைப்பதிவு",
      "Follow Us": "எங்களை பின்தொடருங்கள்",
      "Subscribe to Newsletter": "செய்திமடலுக்கு பதிவு செய்யுங்கள்",
      "Enter email": "மின்னஞ்சலை உள்ளிடவும்",
      "Subscribe": "பதிவு செய்",
      "K.Balaguruva Chettiar Son's Co": "பாலகுருவா செட்டியார் மகன்கள் நிறுவனம்",
      "Copyright": "பதிப்புரிமை"
    },
    home: {
      "Our Premium Cookware Materials": "எங்கள் உயர்தர சமையல் பாத்திரப் பொருட்கள்",
  "Explore the benefits of our high-quality materials used in crafting traditional cookware.": "பாரம்பரிய சமையல் பாத்திரங்களை உருவாக்குவதற்குப் பயன்படுத்தப்படும் எங்கள் உயர்தரப் பொருட்களின் நன்மைகளை ஆராயுங்கள்.",
  "Brass": "பித்தளை",
  "Naturally enhances flavors and ensures even heat distribution for perfect cooking.": "இயற்கையாகவே சுவைகளை மேம்படுத்தி, சமமான வெப்ப விநியோகத்தை உறுதி செய்து சரியான சமையலுக்கு உதவுகிறது.",
  "Bronze": "வெண்கலம்",
  "Durable and resistant to corrosion, ideal for long-lasting traditional cookware.": "நீடித்து உழைக்கக்கூடிய மற்றும் அரிப்புக்கு எதிர்ப்புத் தன்மை கொண்டது, நீண்ட காலம் உழைக்கும் பாரம்பரிய சமையல் பாத்திரங்களுக்கு ஏற்றது.",
  "Cast Iron": "வார்ப்பிரும்பு",
  "Retains heat exceptionally well, making it perfect for slow cooking and searing.": "வெப்பத்தை மிகச் சிறப்பாகத் தக்கவைத்து, மெதுவாக சமைப்பதற்கும் பொரித்து வறுப்பதற்கும் ஏற்றது.",
  "What Our Customers Say": "எங்கள் வாடிக்கையாளர்கள் என்ன சொல்கிறார்கள்",
  "The copper kadai I bought is amazing! It heats evenly and makes cooking so much easier.": "நான் வாங்கிய செம்பு கடாய் அற்புதமானது! இது சமமாக வெப்பமடைகிறது மற்றும் சமையலை மிகவும் எளிதாக்குகிறது.",
  "Priya S., Chennai": "ப்ரியா எஸ்., சென்னை",
  "I love the brass pot from K.Balaguruva Chettiar. It’s perfect for traditional recipes.": "பாலகுருவா செட்டியாரிடமிருந்து வாங்கிய பித்தளை பாத்திரம் எனக்கு மிகவும் பிடிக்கும். இது பாரம்பரிய உணவு வகைகளுக்கு ஏற்றது.",
  "Ramesh K., Coimbatore": "ரமேஷ் கே., கோயம்புத்தூர்",
  "Excellent quality and fast delivery. The bronze uruli is a great addition to my kitchen!": "சிறந்த தரம் மற்றும் விரைவான விநியோகம். வெண்கல உருளி என் சமையலறைக்கு ஒரு சிறந்த கூடுதலாக உள்ளது!",
  "Anitha R., Madurai": "அனிதா ஆர்., மதுரை",
      "Full Name": "முழு பெயர்",
      "Our Premium Products": "எங்கள் உயர்தர தயாரிப்புகள்",
      "Discover our collection of high-quality products designed for you": "உங்களுக்காக வடிவமைக்கப்பட்ட உயர்தர தயாரிப்புகளின் தொகுப்பைக் கண்டறியுங்கள்",
      "Search products...": "தயாரிப்புகளைத் தேடு...",
      "Sort Products": "தயாரிப்புகளை வரிசைப்படுத்து",
      "Clear": "துடை",
      "No products found": "எந்த தயாரிப்புகளும் கிடைக்கவில்லை",
      "Try adjusting your search or filter to find what you're looking for.": "நீங்கள் தேடுவதைக் கண்டறிய உங்கள் தேடலை அல்லது வடிகட்டியை சரிசெய்ய முயற்சிக்கவும்.",
      "Your cart is empty": "உங்கள் கூடை காலியாக உள்ளது",
      "Looks like you haven't added anything to your cart yet. Browse our products and find something you'll love!": "நீங்கள் இன்னும் உங்கள் கூடையில் எதையும் சேர்க்கவில்லை போல் தெரிகிறது. எங்கள் தயாரிப்புகளை உலாவி, நீங்கள் விரும்பும் ஒன்றைக் கண்டறியுங்கள்!",
      "Continue Shopping": "ஷாப்பிங்கைத் தொடரவும்",
      "K.Balaguruva Chettiar Son's Co": "பாலகுருவா செட்டியார் மகன்கள் நிறுவனம்",
      "Welcome to K.Balaguruva Chettiar Son's Co": "பாலகுருவா செட்டியார் மகன்கள் நிறுவனத்திற்கு வரவேற்கிறோம்",
      "Premium Quality Cookware Utensils for a Better Kitchen": "சிறந்த சமையலறைக்கு உயர்தர சமையல் பாத்திரங்கள்",
      "Explore Our Products": "எங்கள் தயாரிப்புகளை ஆராயுங்கள்",
      "Discover K.Balaguruva Chettiar Son's Co": "பாலகுருவா செட்டியார் மகன்கள் நிறுவனத்தை கண்டறியுங்கள்",
      "Crafted for excellence, sustainability, and innovation in every cookwares.": "ஒவ்வொரு சமையல் பாத்திரத்திலும் சிறப்பு, நிலைத்தன்மை மற்றும் புதுமைக்காக வடிவமைக்கப்பட்டவை.",
      "Eco-Friendly": "சுற்றுச்சூழலுக்கு உகந்தவை",
      "Our cookwares are produced using sustainable practices to minimize environmental impact.": "எங்கள் சமையல் பாத்திரங்கள் சுற்றுச்சூழல் பாதிப்பை குறைக்க நிலையான முறைகளைப் பயன்படுத்தி தயாரிக்கப்படுகின்றன.",
      "Recycled Materials": "மறுசுழற்சி செய்யப்பட்ட பொருட்கள்",
      "We offer a range of cookwares made from recycled materials, promoting circular economy.": "நாங்கள் மறுசுழற்சி செய்யப்பட்ட பொருட்களால் ஆன சமையல் பாத்திரங்களை வழங்குகிறோம், இது சுழற்சி பொருளாதாரத்தை ஊக்குவிக்கிறது.",
      "State-of-the-Art Production": "நவீன உற்பத்தி தொழில்நுட்பம்",
      "Our modern facilities ensure consistent quality and efficient production.": "எங்கள் நவீன வசதிகள் நிலையான தரம் மற்றும் திறமையான உற்பத்தியை உறுதி செய்கின்றன.",
      "Why Choose K.Balaguruva Chettiar Son's Co": "ஏன் பாலகுருவா செட்டியார் மகன்கள் நிறுவனத்தை தேர்வு செய்ய வேண்டும்",
      "Wide range of cookware types including copper, brass, bronze, and ceramic cookwares": "செம்பு, பித்தளை, வெண்கலம் மற்றும் செராமிக் சமையல் பாத்திரங்கள் உட்பட பல்வேறு வகையான சமையல் பாத்திரங்கள்",
      "Customizable options to meet your specific requirements and preferences": "உங்கள் குறிப்பிட்ட தேவைகள் மற்றும் விருப்பங்களை பூர்த்தி செய்ய தனிப்பயனாக்கப்பட்ட விருப்பங்கள்",
      "Commitment to delivering consistent quality and customer satisfaction": "நிலையான தரம் மற்றும் வாடிக்கையாளர் திருப்தியை வழங்குவதற்கான அர்ப்பணிப்பு",
      "Sustainable practices and eco-friendly options": "நிலையான முறைகள் மற்றும் சுற்றுச்சூழலுக்கு உகந்த விருப்பங்கள்",
      "Competitive pricing with a focus on timely and reliable delivery": "சரியான மற்றும் நம்பகமான விநியோகத்திற்கு முக்கியத்துவம் அளித்து போட்டித்தன்மையுள்ள விலை",
      "Our Commitment to Sustainability": "நிலைத்தன்மைக்கான எங்கள் அர்ப்பணிப்பு",
      "At K.Balaguruva Chettiar Son's Co, we are dedicated to reducing our environmental footprint through innovative practices and sustainable materials.": "பாலகுருவா செட்டியார் மகன்கள் நிறுவனத்தில், புதுமையான முறைகள் மற்றும் நிலையான பொருட்கள் மூலம் எங்கள் சுற்றுச்சூழல் தடத்தை குறைப்பதற்கு நாங்கள் அர்ப்பணித்துள்ளோம்.",
      "Learn More About Our Initiatives": "எங்கள் முயற்சிகள் பற்றி மேலும் அறியவும்",
      "Welcome to": "வரவேற்கிறோம்",
      "Premium Quality Yarns for a Sustainable Future": "நிலையான எதிர்காலத்திற்கான உயர்தர நூல்கள்",
      "Explore Our Products": "எங்கள் தயாரிப்புகளை ஆராயுங்கள்",
      "Discover": "கண்டறியுங்கள்",
      "Crafted for excellence, sustainability, and innovation in every thread.": "ஒவ்வொரு நூலிலும் சிறப்பு, நிலைத்தன்மை மற்றும் புதுமைக்காக வடிவமைக்கப்பட்டது.",
      "Eco-Friendly": "சுற்றுச்சூழல் நட்பு",
      "Our yarns are produced using sustainable practices to minimize environmental impact.": "நமது நூல்கள் சுற்றுச்சூழல் பாதிப்பைக் குறைக்க நிலையான நடைமுறைகளைப் பயன்படுத்தி உற்பத்தி செய்யப்படுகின்றன.",
      "Recycled Fibers": "மறுசுழற்சி இழைகள்",
      "We offer a range of yarns made from recycled materials, promoting circular economy.": "சுழற்சிப் பொருளாதாரத்தை ஊக்குவிக்கும் மறுசுழற்சி பொருட்களிலிருந்து தயாரிக்கப்பட்ட பல வகையான நூல்களை நாங்கள் வழங்குகிறோம்.",
      "State-of-the-Art Production": "நவீன உற்பத்தி",
      "Our modern facilities ensure consistent quality and efficient production.": "எங்களின் நவீன வசதிகள் சீரான தரம் மற்றும் திறமையான உற்பத்தியை உறுதி செய்கின்றன.",
      "Why Choose": "ஏன் தேர்வு செய்ய வேண்டும்",
      "Our Journey": "எங்கள் பயணம்",
      "What Our Clients Say": "எங்கள் வாடிக்கையாளர்கள் என்ன சொல்கிறார்கள்",
      "Our Commitment to Sustainability": "நிலைத்தன்மை மீதான எங்கள் உறுதிப்பாடு",
      "Learn More About Our Initiatives": "எங்கள் முயற்சிகளைப் பற்றி மேலும் அறிக",
      "Our Premium Products": "எங்களின் உயர்தர தயாரிப்புகள்",
      "Explore our wide range of high-quality yarns designed for various applications": "பல்வேறு பயன்பாடுகளுக்காக வடிவமைக்கப்பட்ட உயர்தர நூல்களின் பரந்த வரிசையை ஆராயுங்கள்",
      "View Full Catalog": "முழு பட்டியலைக் காட்டு",
      "View Details": "விவரங்களைக் காண",
      "Recycled Polyester Yarn": "மறுசுழற்சி பாலியெஸ்டர் நூல்",
      "Eco-friendly yarn made from recycled plastic bottles": "மறுசுழற்சி பிளாஸ்டிக் பாட்டில்களில் இருந்து தயாரிக்கப்பட்ட சுற்றுச்சூழல் நட்பு நூல்",
      "Organic Cotton Yarn": "ஆர்கானிக் பருத்தி நூல்",
      "100% organic cotton, sustainably harvested and processed": "100% ஆர்கானிக் பருத்தி, நிலையாக அறுவடை செய்து பதப்படுத்தப்பட்டது",
      "Ring Spun Yarn": "ரிங் ஸ்பன் நூல்",
      "Premium quality for high-performance textiles": "உயர் செயல்திறன் ஜவுளிக்கான உயர்தர தரம்",
      "Vortex Yarn": "வார்டெக்ஸ் நூல்",
      "Advanced technology for superior strength and comfort": "உயர் வலிமை மற்றும் ஆறுதலுக்கான மேம்பட்ட தொழில்நுட்பம்",
      "Wide range of yarn types including recycled, OE, ring spun, and vortex yarns": "மறுசுழற்சி, OE, ரிங் ஸ்பன் மற்றும் வார்டெக்ஸ் நூல்கள் உள்ளிட்ட பலவகையான நூல் வகைகள்",
      "Customizable options to meet your specific requirements and preferences": "உங்கள் குறிப்பிட்ட தேவைகள் மற்றும் விருப்பங்களைப் பூர்த்தி செய்ய தனிப்பயனாக்கக்கூடிய விருப்பங்கள்",
      "Commitment to delivering consistent quality and customer satisfaction": "நிலையான தரம் மற்றும் வாடிக்கையாளர் திருப்தியை வழங்குவதற்கான அர்ப்பணிப்பு",
      "Sustainable practices and eco-friendly options": "நிலையான நடைமுறைகள் மற்றும் சுற்றுச்சூழல் நட்பு விருப்பங்கள்",
      "Competitive pricing with a focus on timely and reliable delivery": "சரியான நேரத்தில் மற்றும் நம்பகமான விநியோகத்தில் கவனம் செலுத்தி போட்டி விலை நிர்ணயம்",
      "Our Manufacturing Excellence": "எங்களின் உற்பத்தி சிறப்பு",
      "Raw Material Selection": "மூலப்பொருள் தேர்வு",
      "We carefully source sustainable and high-quality raw materials for our yarns": "எங்கள் நூல்களுக்கான நிலையான மற்றும் உயர்தர மூலப்பொருட்களை நாங்கள் கவனமாக தேர்வு செய்கிறோம்",
      "Cleaning & Processing": "சுத்தம் செய்தல் & செயலாக்கம்",
      "Advanced techniques to clean and prepare fibers for spinning": "நூற்புக்கான நார்களை சுத்தம் செய்து தயாரிக்க மேம்பட்ட நுட்பங்கள்",
      "Spinning & Quality Control": "நூற்பு & தரக் கட்டுப்பாடு",
      "State-of-the-art spinning technology with rigorous quality checks": "கடுமையான தரச் சோதனைகளுடன் நவீன நூற்பு தொழில்நுட்பம்",
      "Finishing & Packaging": "முடித்தல் & பேக்கேஜிங்",
      "Precision finishing and eco-friendly packaging solutions": "துல்லியமான முடிவு மற்றும் சுற்றுச்சூழல் நட்பு பேக்கேஜிங் தீர்வுகள்",
      "Industry Applications": "தொழில் பயன்பாடுகள்",
      "Our versatile yarn solutions power innovations across multiple industries": "எங்களின் பல்துறை நூல் தீர்வுகள் பல தொழில்களில் புதுமைகளை உருவாக்குகின்றன",
      "Fashion & Apparel": "பேஷன் & ஆடைகள்",
      "Premium yarns for high-quality garments and fashion accessories": "உயர்தர ஆடைகள் மற்றும் பேஷன் துணைப்பொருட்களுக்கான உயர்தர நூல்கள்",
      "Automotive Textiles": "ஆட்டோமொபைல் ஜவுளிகள்",
      "Durable and specialized yarns for automotive interiors and components": "வாகன உள்ளமைப்புகள் மற்றும் கூறுகளுக்கான நீடித்த மற்றும் சிறப்பு நூல்கள்",
      "Medical Textiles": "மருத்துவ ஜவுளிகள்",
      "Antimicrobial and high-performance yarns for healthcare applications": "சுகாதார பயன்பாடுகளுக்கான நுண்ணுயிர் எதிர்ப்பு மற்றும் உயர் செயல்திறன் நூல்கள்",
      "Home Furnishing": "வீட்டு அலங்காரப் பொருட்கள்",
      "Decorative and functional yarns for home textiles and upholstery": "வீட்டு ஜவுளிகள் மற்றும் உபோல்ஸ்டரிக்கான அலங்கார மற்றும் செயல்பாட்டு நூல்கள்",
      "Learn more": "மேலும் அறிக",
      "Serving clients globally in over 30 countries": "30க்கும் மேற்பட்ட நாடுகளில் உலகளவில் வாடிக்கையாளர்களுக்கு சேவை",
      "Quality Assurance": "தர உறுதிப்பாடு",
      "Our comprehensive quality management system ensures every yarn meets the highest standards": "எங்களின் விரிவான தர மேலாண்மை அமைப்பு ஒவ்வொரு நூலும் உயர்ந்த தரத்தை பூர்த்தி செய்வதை உறுதி செய்கிறது",
      "Material Inspection": "பொருள் ஆய்வு",
      "Rigorous testing of all raw materials before entering production": "உற்பத்திக்கு முன் அனைத்து மூலப்பொருட்களின் கடுமையான சோதனை",
      "Process Monitoring": "செயல்முறை கண்காணிப்பு",
      "Real-time quality monitoring throughout the manufacturing process": "உற்பத்தி செயல்முறை முழுவதும் நேரலை தர கண்காணிப்பு",
      "Laboratory Testing": "ஆய்வக சோதனை",
      "Comprehensive testing for tensile strength, color fastness, and durability": "இழுவை வலிமை, நிற நிலைத்தன்மை மற்றும் நீடித்த உழைப்புக்கான விரிவான சோதனை",
      "Certification": "சான்றிதழ்",
      "Meeting international quality standards with third-party verification": "மூன்றாம் தரப்பு சரிபார்ப்புடன் சர்வதேச தர நியமங்களை பூர்த்தி செய்தல்",
      "Quality Approval Rate": "தர ஒப்புதல் விகிதம்",
      "Certified Quality Management": "சான்றளிக்கப்பட்ட தர மேலாண்மை",
      "Quality Monitoring": "தர கண்காணிப்பு",
      "What Our Clients Say": "எங்கள் வாடிக்கையாளர்கள் என்ன சொல்கிறார்கள்",      
      "Their commitment to sustainability aligns perfectly with our values. Excellent service!": "நிலைத்தன்மை மீதான அவர்களின் அர்ப்பணிப்பு எங்கள் மதிப்புகளுடன் முற்றிலும் ஒத்துப்போகிறது. சிறந்த சேவை!",
      "Our Commitment to Sustainability": "நிலைத்தன்மை மீதான எங்கள் உறுதிப்பாடு",
      "Learn More About Our Initiatives": "எங்கள் முயற்சிகளைப் பற்றி மேலும் அறிக",
      "Fashion Limited": "பேஷன் லிமிடெட்",
      "Eco Textiles": "எக்கோ டெக்ஸ்டைல்ஸ்",
      "Global Fabrics": "குளோபல் பேப்ரிக்ஸ்"

    },
    products: {
      "Loading amazing products...": "அற்புதமான தயாரிப்புகளை ஏற்றுகிறது...",
      "Something went wrong": "ஏதோ தவறு நடந்துவிட்டது",
      "Try Again": "மீண்டும் முயற்சி செய்",
      "Add to Cart": "கூடையில் சேர்",
      "Out of Stock": "கையிருப்பில் இல்லை",
      "In Stock": "கையிருப்பில் உள்ளது",
      "units": "அலகுகள்",
      "New": "புதியது",
      "OFF": "தள்ளுபடி",
      "reviews": "மதிப்புரைகள்"
    },
    about: {
      "Our success is built on the expertise and dedication of our team. From our skilled craftsmen to our innovative designers, every member of K.Balaguruva Chettiar Son's Co is committed to delivering excellence in every cookware utensil we produce.": "எங்கள் வெற்றி எங்கள் குழுவின் நிபுணத்துவம் மற்றும் அர்ப்பணிப்பின் மீது கட்டமைக்கப்பட்டுள்ளது. எங்கள் திறமையான கைவினைஞர்கள் முதல் புதுமையான வடிவமைப்பாளர்கள் வரை, பாலகுருவா செட்டியார் மகன்கள் நிறுவனத்தின் ஒவ்வொரு உறுப்பினரும் நாங்கள் உற்பத்தி செய்யும் ஒவ்வொரு சமையல் பாத்திரத்திலும் சிறப்பை வழங்குவதற்கு உறுதிபூண்டுள்ளனர்.",
  "At K.Balaguruva Chettiar Son's Co, our mission is to preserve the art of traditional cookware craftsmanship while delivering exceptional quality to kitchens worldwide. We aim to inspire culinary creativity with cookware that lasts for generations.": "பாலகுருவா செட்டியார் மகன்கள் நிறுவனத்தில், பாரம்பரிய சமையல் பாத்திரக் கைவினைத்திறனின் கலையைப் பாதுகாக எங்கள் வெற்றி எங்கள் குழுவின் நிபுணத்துவம் மற்றும் அர்ப்பணிப்பின் மீது கட்டமைக்கப்பட்டுள்ளது. எங்கள் திறமையான கைவினைஞர்கள் முதல் புதுமையான வடிவமைப்பாளர்கள் வரை, பாலகுருவா செட்டியார் மகன்கள் நிறுவனத்தின் ஒவ்வொரு உறுப்பினரும் நாங்கள் உற்பத்தி செய்யும் ஒவ்வொரு சமையல் பாத்திரத்திலும் சிறப்பை வழங்குவதற்கு உறுதிபூண்டுள்ளனர்.",
      "About K.Balaguruva Chettiar Son's Co": "பாலகுருவா செட்டியார் மகன்கள் நிறுவனம் பற்றி",
      "Founded in 1992, K.Balaguruva Chettiar Son's Co has been at the forefront of the cookware industry for over three decades. What started as a small family-owned business has grown into a leading manufacturer of high-quality cookwares, serving customers worldwide.": "1992இல் நிறுவப்பட்ட பாலகுருவா செட்டியார் மகன்கள் நிறுவனம், மூன்று தசாப்தங்களுக்கும் மேலாக சமையல் பாத்திரத் துறையில் முன்னணியில் உள்ளது. ஒரு சிறிய குடும்பத்திற்கு சொந்தமான வணிகமாக தொடங்கியது, உலகளவில் வாடிக்கையாளர்களுக்கு சேவை செய்யும் உயர்தர சமையல் பாத்திரங்களின் முன்னணி உற்பத்தியாளராக வளர்ந்துள்ளது.",
      "At K.Balaguruva Chettiar Son's Co, we believe in responsible manufacturing. We're committed to reducing our environmental impact through sustainable practices, including the use of recycled materials, energy-efficient production methods, and waste reduction initiatives.": "பாலகுருவா செட்டியார் மகன்கள் நிறுவனத்தில், நாங்கள் பொறுப்பான உற்பத்தியில் நம்பிக்கை கொண்டுள்ளோம். மறுசுழற்சி செய்யப்பட்ட பொருட்களின் பயன்பாடு, ஆற்றல் திறன் கொண்ட உற்பத்தி முறைகள் மற்றும் கழிவு குறைப்பு முயற்சிகள் உள்ளிட்ட நிலையான முறைகள் மூலம் எங்கள் சுற்றுச்சூழல் தாக்கத்தை குறைப்பதற்கு நாங்கள் உறுதிபூண்டுள்ளோம்.",
      "Our success is built on the expertise and dedication of our team. From our skilled craftmens to our innovative designers, every member of K.Balaguruva Chettiar Son's Co is committed to delivering excellence in every cookware utensil we produce.": "எங்கள் வெற்றி எங்கள் குழுவின் நிபுணத்துவம் மற்றும் அர்ப்பணிப்பின் மீது கட்டமைக்கப்பட்டுள்ளது. எங்கள் திறமையான கைவினைஞர்கள் முதல் புதுமையான வடிவமைப்பாளர்கள் வரை, பாலகுருவா செட்டியார் மகன்கள் நிறுவனத்தின் ஒவ்வொரு உறுப்பினரும் நாங்கள் உற்பத்தி செய்யும் ஒவ்வொரு சமையல் பாத்திரத்திலும் சிறப்பை வழங்குவதற்கு உறுதிபூண்டுள்ளனர்.",
      "Pioneering excellence in textile manufacturing since 2020": "2020 ஆம் ஆண்டு முதல் ஜவுளி உற்பத்தியில் முன்னோடியாக உள்ளோம்",
      "Products Manufactured": "உற்பத்தி செய்யப்பட்ட தயாரிப்புகள்",
      "States Served": "சேவை செய்யப்பட்ட மாநிலங்கள்",
      "Customer Satisfaction": "வாடிக்கையாளர் திருப்தி",
      "Our History": "எங்கள் வரலாறு",
      "Our Team": "எங்கள் குழு",
      "Share Your Experience": "உங்கள் அனுபவத்தைப் பகிரவும்",
      "Our Vision": "எங்கள் பார்வை",
      "Our Mission": "எங்கள் நோக்கம்",
      "Core Values": "முக்கிய மதிப்புகள்",
      "Company founded": "நிறுவனம் தொடங்கப்பட்டது",
      "First international export": "முதல் சர்வதேச ஏற்றுமதி",
      "Sustainability certification": "நிலைத்தன்மை சான்றிதழ்",
      "Industry innovation award": "தொழில்துறை புதுமை விருது",
      "Fashion Designer": "ஆடை வடிவமைப்பாளர்",
      "Production Manager": "உற்பத்தி மேலாளர்",
      "Renewable Energy Usage": "புதுப்பிக்கத்தக்க எரிசக்தி பயன்பாடு",
      "Water Recycling": "நீர் மறுசுழற்சி",
      "Waste Reduction": "கழிவு குறைப்பு"
    },
    contact: {
      "Get in Touch With Us": "எங்களை தொடர்பு கொள்ளுங்கள்",
      "Have questions or want to discuss your requirements? We're here to help!": "கேள்விகள் உள்ளதா அல்லது உங்கள் தேவைகளை விவாதிக்க விரும்புகிறீர்களா? உதவ நாங்கள் இங்கே இருக்கிறோம்!",
      "Send us a Message": "எங்களுக்கு ஒரு செய்தி அனுப்புங்கள்",
      "Name": "பெயர்",
      "Phone Number": "தொலைபேசி எண்",
      "Email": "மின்னஞ்சல்",
      "Subject": "பொருள்",
      "Message": "செய்தி",
      "Send Message": "செய்தி அனுப்பு",
      "Contact Information": "தொடர்பு தகவல்",
      "Office": "அலுவலகம்",
      "Mobile": "கைபேசி",
      "WhatsApp": "வாட்ஸ்ஆப்",
      "Address": "முகவரி",
      "K.Balaguruva Chettiar Son's Co": "பாலகுருவா செட்டியார் மகன்கள் நிறுவனம்",
      "97, Agraharam Street, Erode": "97, அக்ரஹாரம் தெரு, ஈரோடு",
      "Save Contact": "தொடர்பை சேமி",
      "Business Hours": "வணிக நேரங்கள்",
      "Monday": "திங்கள்",
      "Tuesday": "செவ்வாய்",
      "Wednesday": "புதன்",
      "Thursday": "வியாழன்",
      "Friday": "வெள்ளி",
      "Saturday": "சனி",
      "Sunday": "ஞாயிறு",
      "Find Us": "எங்களைக் கண்டறியுங்கள்"
    }
    },
    cart: {
      "My Cart": "என் கூடை",
      "Your cart is empty": "உங்கள் கூடை காலியாக உள்ளது",
      "Looks like you haven't added anything to your cart yet.": "நீங்கள் இன்னும் உங்கள் கூடையில் எதையும் சேர்க்கவில்லை போல் தெரிகிறது.",
      "Browse our products and find something you'll love!": "எங்கள் தயாரிப்புகளைப் பார்வையிட்டு, நீங்கள் விரும்பும் ஏதாவதைக் கண்டறியுங்கள்!",
      "Continue Shopping": "தொடர்ந்து ஷாப்பிங் செய்யுங்கள்",
      "Product": "தயாரிப்பு",
      "Price": "விலை",
      "Tax": "வரி",
      "Quantity": "அளவு",
      "Total": "மொத்தம்",
      "Remove": "நீக்கு",
      "Return to shop": "கடைக்குத் திரும்பு",
      "Subtotal": "கூட்டுத்தொகை",
      "Continue to Shipping": "அனுப்புதலுக்குத் தொடரவும்",
      "Shipping Information": "அனுப்புதல் தகவல்",
      "Full Name": "முழு பெயர்",
      "Address": "முகவரி",
      "City": "நகரம்",
      "Postal Code": "அஞ்சல் குறியீடு",
      "Order Summary": "ஆர்டர் சுருக்கம்",
      "Delivery Options": "அனுப்புதல் விருப்பங்கள்",
      "Select your preferred delivery method": "உங்களுக்கு விருப்பமான அனுப்புதல் முறையைத் தேர்ந்தெடுக்கவும்",
      "Standard Delivery": "வழக்கமான அனுப்புதல்",
      "3-5 business days - Free": "3-5 வணிக நாட்கள் - இலவசம்",
      "Express Delivery": "விரைவு அனுப்புதல்",
      "1-2 business days": "1-2 வணிக நாட்கள்",
      "Payment": "கட்டணம்",
      "Processing your payment...": "உங்கள் பணம் செலுத்துதலை செயலாக்குகிறது...",
      "Payment successful!": "பணம் செலுத்துதல் வெற்றிகரமாக முடிந்தது!",
      "Payment canceled": "கட்டணம் ரத்து செய்யப்பட்டது",
      "Pay": "கட்டணம் செலுத்து",
      "Order Confirmed!": "ஆர்டர் உறுதி செய்யப்பட்டது!",
      "Thank you for your purchase": "உங்கள் வாங்குதலுக்கு நன்றி",
      "Order Reference": "ஆர்டர் குறிப்பு",
      "Order Details": "ஆர்டர் விவரங்கள்"
    },
    user: {
      "Member": "உறுப்பினர்",
      "Account Security": "கணக்கு பாதுகாப்பு",
      "Email verification": "மின்னஞ்சல் சரிபார்ப்பு",
      "Change password": "கடவுச்சொல்லை மாற்று",
      "Account Activity": "கணக்கு செயல்பாடு",
      "Last login": "கடைசி உள்நுழைவு",
      "Account created": "கணக்கு உருவாக்கப்பட்டது",
      "Recent Orders": "சமீபத்திய ஆர்டர்கள்",
      "No recent orders found.": "சமீபத்திய ஆர்டர்கள் எதுவும் இல்லை.",
      "Browse products": "தயாரிப்புகளை உலாவ",
      "Welcome Back": "மீண்டும் வரவேற்கிறோம்",
      "Log in to your account to continue": "தொடர உங்கள் கணக்கில் உள்நுழையவும்",
      "Email Address": "மின்னஞ்சல் முகவரி",
      "Password": "கடவுச்சொல்",
      "Forgot password?": "கடவுச்சொல் மறந்துவிட்டதா?",
      "Sign In": "உள்நுழைய",
      "Signing in...": "உள்நுழைகிறது...",
      "Or continue with": "அல்லது இதனுடன் தொடரவும்",
      "Don't have an account?": "கணக்கு இல்லையா?",
      "Sign Up": "பதிவு செய்ய"
    },
    recommendations: {
      "AI Yarn Recommendations": "AI நூல் பரிந்துரைகள்",
      "Discover unique yarn suggestions tailored to your preferences": "உங்கள் விருப்பங்களுக்கு ஏற்ப தனித்துவமான நூல் பரிந்துரைகளைக் கண்டறியுங்கள்",
      "Each search gives unique results!": "ஒவ்வொரு தேடலும் தனித்துவமான முடிவுகளைத் தருகிறது!",
      "Your Preferences": "உங்கள் விருப்பங்கள்",
      "Select purpose": "நோக்கத்தைத் தேர்ந்தெடுக்கவும்",
      "Select blend": "கலவையைத் தேர்ந்தெடுக்கவும்",
      "Any rating": "எந்த மதிப்பீடும்",
      "Select count": "எண்ணிக்கையைத் தேர்ந்தெடுக்கவும்",
      "Select price range": "விலை வரம்பைத் தேர்ந்தெடுக்கவும்",
      "Enter quantity": "அளவை உள்ளிடவும்",
      "Purpose": "நோக்கம்",
      "Blend Type": "கலவை வகை",
      "Minimum Rating": "குறைந்தபட்ச மதிப்பீடு",
      "Count": "எண்ணிக்கை",
      "Price Range": "விலை வரம்பு",
      "Quantity (kg)": "அளவு (கிலோ)",
      "Creativity Factor": "படைப்பாற்றல் காரணி",
      "Logical": "தருக்கரீதியான",
      "Creative": "படைப்பாற்றல்",
      "Get Creative Recommendations": "படைப்பாற்றல் பரிந்துரைகளைப் பெறுங்கள்",
      "Creative Suggestions": "படைப்பாற்றல் பரிந்துரைகள்",
      "Select your preferences or use the Surprise Me button!": "உங்கள் விருப்பங்களைத் தேர்ந்தெடுக்கவும் அல்லது ஆச்சரியப்படுத்து பொத்தானைப் பயன்படுத்தவும்!",
      "About Creative Recommendations": "படைப்பாற்றல் பரிந்துரைகள் பற்றி",
      "Our creative recommendation system uses advanced algorithms to suggest yarns that might inspire your next project. Adjust the creativity slider to control how unique and surprising your recommendations will be:": "உங்கள் அடுத்த திட்டத்திற்கான நூல்களை பரிந்துரைக்க எங்கள் படைப்பாற்றல் பரிந்துரை அமைப்பு மேம்பட்ட அல்காரிதங்களைப் பயன்படுத்துகிறது. உங்கள் பரிந்துரைகள் எவ்வளவு தனித்துவமானதாகவும் ஆச்சரியமாகவும் இருக்கும் என்பதைக் கட்டுப்படுத்த படைப்பாற்றல் ஸ்லைடரை சரிசெய்யவும்:",
      "Low Creativity (0.0-0.3)": "குறைந்த படைப்பாற்றல் (0.0-0.3)",
      "More logical recommendations based closely on your preferences.": "உங்கள் விருப்பங்களை அடிப்படையாகக் கொண்ட மேலும் தருக்கரீதியான பரிந்துரைகள்.",
      "Medium Creativity (0.3-0.7)": "நடுத்தர படைப்பாற்றல் (0.3-0.7)",
      "Balanced suggestions with some unique alternatives you might not have considered.": "நீங்கள் கருத்தில் கொள்ளாத சில தனித்துவமான மாற்றுகளுடன் சமநிலை பரிந்துரைகள்.",
      "High Creativity (0.7-1.0)": "உயர் படைப்பாற்றல் (0.7-1.0)",
      "Surprising and unconventional recommendations to spark new ideas!": "புதிய யோசனைகளைத் தூண்ட ஆச்சரியமான மற்றும் மரபுசாரா பரிந்துரைகள்!",
      "User Reviews": "பயனர் மதிப்புரைகள்",
      "Great quality yarn! Perfect for my knitting projects.": "சிறந்த தரமான நூல்! என் பின்னல் திட்டங்களுக்கு சரியாக பொருந்துகிறது.",
      "The colors are vibrant and the yarn is very durable.": "வண்ணங்கள் துடிப்பானவை மற்றும் நூல் மிகவும் உறுதியானது.",
      "Match": "பொருத்தம்",
      "Premium selection": "உயர்தர தேர்வு",
      "Special offer": "சிறப்பு சலுகை",
      "Previous": "முந்தைய",
      "Next": "அடுத்த",
      "Page": "பக்கம்",
      "of": "இல்",
      "Generating...": "உருவாக்குகிறது...",
      "Analyzing Yarn Patterns...": "நூல் வடிவங்களை பகுப்பாய்வு செய்கிறது...",
      "Processing": "செயலாக்குகிறது",
      "highly creative": "மிகவும் படைப்பாற்றல்",
      "balanced": "சமநிலை",
      "logical": "தருக்கரீதியான",
      "recommendations": "பரிந்துரைகள்",
      "Matching your preferences with available yarns": "கிடைக்கும் நூல்களுடன் உங்கள் விருப்பங்களை பொருத்துகிறது"
    
  }
};

// Helper function to get nested translation
const getTranslation = (obj, key) => {
  // If the path is a string, split it into an array
  const path = typeof key === 'string' ? key.split('.') : key;
  
  // If we're at the end of the path, return the value
  if (path.length === 1) {
    return obj[path[0]] || key;
  }
  
  // Otherwise, recurse on the next part of the path
  const next = path.shift();
  return obj[next] ? getTranslation(obj[next], path) : key;
};

export const TranslationProvider = ({ children }) => {
  // Initialize language from localStorage or default to browser language or "en"
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) return savedLanguage;
    
    // Try to detect browser language
    const browserLang = navigator.language?.split('-')[0];
    return translations[browserLang] ? browserLang : 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Optionally set HTML lang attribute
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Function to change language
  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    } else {
      console.warn(`Translation not available for language: ${newLanguage}`);
    }
  };

  // Function to translate text
  const t = (key, section = 'common') => {
    // If language is English, return the key directly
    if (language === 'en') return key;
    
    // Try to get translation from specific section
    if (translations[language][section]?.[key]) {
      return translations[language][section][key];
    }
    
    // Try to get translation from common section
    if (translations[language].common?.[key]) {
      return translations[language].common[key];
    }
    
    // If no translation found, return the key itself
    return key;
  };

  // Function to translate with variable replacements
  const tFormat = (key, replacements = {}, section = 'common') => {
    let text = t(key, section);
    
    // Replace placeholders in the form {{key}} with values from replacements
    Object.keys(replacements).forEach(replaceKey => {
      text = text.replace(
        new RegExp(`{{${replaceKey}}}`, 'g'),
        replacements[replaceKey]
      );
    });
    
    return text;
  };

  // Check if the current language is RTL
  const isRTL = language === 'ar'; // Add other RTL languages as needed

  const value = {
    language,
    changeLanguage,
    t,
    tFormat,
    isRTL,
    availableLanguages: Object.keys(translations)
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translations in components
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

// Export context for direct usage if needed
export default TranslationContext;
