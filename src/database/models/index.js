const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    description: DataTypes.STRING(255),
    scope: { type: DataTypes.ENUM('platform', 'household'), defaultValue: 'household' },
  }, { tableName: 'roles' });

  const Permission = sequelize.define('Permission', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    code: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: DataTypes.STRING(255),
    module: { type: DataTypes.STRING(50), allowNull: false },
  }, { tableName: 'permissions' });

  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    avatar_url: DataTypes.TEXT,
    role_id: DataTypes.UUID,
    status: { type: DataTypes.ENUM('active', 'suspended', 'deleted'), defaultValue: 'active' },
    email_verified_at: DataTypes.DATE,
    last_login_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  }, { tableName: 'users', paranoid: false, defaultScope: { where: { deleted_at: null } } });

  const AdminUser = sequelize.define('AdminUser', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    role_id: DataTypes.UUID,
    status: { type: DataTypes.ENUM('active', 'suspended'), defaultValue: 'active' },
    last_login_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  }, { tableName: 'admin_users' });

  const RefreshToken = sequelize.define('RefreshToken', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: DataTypes.UUID,
    admin_user_id: DataTypes.UUID,
    token_hash: { type: DataTypes.STRING(255), allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked_at: DataTypes.DATE,
    replaced_by_token_id: DataTypes.UUID,
  }, { tableName: 'refresh_tokens', updatedAt: false });

  const Household = sequelize.define('Household', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    owner_user_id: { type: DataTypes.UUID, allowNull: false },
    invite_code: { type: DataTypes.STRING(12), unique: true },
    status: { type: DataTypes.ENUM('active', 'deactivated'), defaultValue: 'active' },
    timezone: { type: DataTypes.STRING(50), defaultValue: 'Asia/Kolkata' },
    deleted_at: DataTypes.DATE,
  }, { tableName: 'households' });

  const HouseholdInvite = sequelize.define('HouseholdInvite', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    household_id: { type: DataTypes.UUID, allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false },
    token: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    invited_by_user_id: { type: DataTypes.UUID, allowNull: false },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    accepted_at: DataTypes.DATE,
  }, { tableName: 'household_invites' });

  const HouseholdMember = sequelize.define('HouseholdMember', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    household_id: { type: DataTypes.UUID, allowNull: false },
    user_id: DataTypes.UUID,
    display_name: { type: DataTypes.STRING(100), allowNull: false },
    relationship: DataTypes.STRING(50),
    age: DataTypes.INTEGER,
    is_admin: { type: DataTypes.BOOLEAN, defaultValue: false },
    diet_type: DataTypes.ENUM('vegetarian', 'vegan', 'omnivore', 'pescatarian'),
    allergies: { type: DataTypes.JSONB, defaultValue: [] },
    restrictions: { type: DataTypes.JSONB, defaultValue: [] },
    health_goals: { type: DataTypes.JSONB, defaultValue: [] },
    deficiencies: { type: DataTypes.JSONB, defaultValue: [] },
    bmi: DataTypes.DECIMAL(5, 2),
    calorie_target: DataTypes.INTEGER,
    protein_target_g: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE,
  }, { tableName: 'household_members' });

  const CuisineType = sequelize.define('CuisineType', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    emoji: DataTypes.STRING(10),
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'cuisine_types' });

  const PantryCategory = sequelize.define('PantryCategory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    emoji: DataTypes.STRING(10),
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'pantry_categories' });

  const GroceryCatalog = sequelize.define('GroceryCatalog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    category_id: DataTypes.UUID,
    default_unit: { type: DataTypes.ENUM('g', 'kg', 'ml', 'l', 'pcs', 'cup', 'tbsp'), defaultValue: 'g' },
    barcode: { type: DataTypes.STRING(50), unique: true },
    shelf_life_days: DataTypes.INTEGER,
    nutrition_per_100g: DataTypes.JSONB,
    image_url: DataTypes.TEXT,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_by_admin_id: DataTypes.UUID,
    deleted_at: DataTypes.DATE,
  }, { tableName: 'grocery_catalog' });

  const PantryItem = sequelize.define('PantryItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    household_id: { type: DataTypes.UUID, allowNull: false },
    grocery_catalog_id: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    unit: { type: DataTypes.STRING(20), allowNull: false },
    location: { type: DataTypes.ENUM('pantry', 'refrigerator', 'freezer', 'counter'), defaultValue: 'pantry' },
    expiry_date: DataTypes.DATEONLY,
    purchase_date: DataTypes.DATEONLY,
    low_stock_threshold: DataTypes.DECIMAL(10, 2),
    notes: DataTypes.TEXT,
    added_by_user_id: DataTypes.UUID,
    deleted_at: DataTypes.DATE,
  }, { tableName: 'pantry_items' });

  const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    pantry_item_id: { type: DataTypes.UUID, allowNull: false },
    household_id: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM('add', 'deduct', 'adjust', 'expired', 'waste'), allowNull: false },
    quantity_change: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantity_after: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    reason: DataTypes.STRING(255),
    recipe_id: DataTypes.UUID,
    created_by_user_id: DataTypes.UUID,
  }, { tableName: 'inventory_transactions', updatedAt: false });

  const Recipe = sequelize.define('Recipe', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: DataTypes.TEXT,
    cuisine_type_id: DataTypes.UUID,
    prep_time_minutes: DataTypes.INTEGER,
    cook_time_minutes: DataTypes.INTEGER,
    difficulty: DataTypes.ENUM('easy', 'medium', 'hard'),
    servings: { type: DataTypes.INTEGER, defaultValue: 4 },
    calories_per_serving: DataTypes.INTEGER,
    nutrition_highlights: DataTypes.JSONB,
    instructions: DataTypes.JSONB,
    image_url: DataTypes.TEXT,
    source: { type: DataTypes.ENUM('gemini', 'admin', 'user'), defaultValue: 'gemini' },
    gemini_request_id: DataTypes.STRING(100),
    is_published: { type: DataTypes.BOOLEAN, defaultValue: true },
    deleted_at: DataTypes.DATE,
  }, { tableName: 'recipes' });

  const RecipeIngredient = sequelize.define('RecipeIngredient', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    recipe_id: { type: DataTypes.UUID, allowNull: false },
    grocery_catalog_id: { type: DataTypes.UUID, allowNull: false },
    quantity: DataTypes.DECIMAL(10, 2),
    unit: DataTypes.STRING(20),
    is_optional: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: 'recipe_ingredients' });

  const RecipeRecommendation = sequelize.define('RecipeRecommendation', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    household_id: { type: DataTypes.UUID, allowNull: false },
    recipe_id: { type: DataTypes.UUID, allowNull: false },
    pantry_match_percent: DataTypes.DECIMAL(5, 2),
    reason: DataTypes.TEXT,
    rank: DataTypes.INTEGER,
    filters: DataTypes.JSONB,
    gemini_prompt_snapshot: DataTypes.TEXT,
    accepted_at: DataTypes.DATE,
    dismissed_at: DataTypes.DATE,
  }, { tableName: 'recipe_recommendations' });

  const RecipeRating = sequelize.define('RecipeRating', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    recipe_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    household_id: { type: DataTypes.UUID, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    feedback: DataTypes.TEXT,
  }, { tableName: 'recipe_ratings' });

  const ShoppingListItem = sequelize.define('ShoppingListItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    household_id: { type: DataTypes.UUID, allowNull: false },
    grocery_catalog_id: DataTypes.UUID,
    custom_name: DataTypes.STRING(150),
    quantity: DataTypes.DECIMAL(10, 2),
    unit: DataTypes.STRING(20),
    reason: { type: DataTypes.ENUM('missing', 'low_stock', 'expiring', 'planned_meal', 'manual'), defaultValue: 'manual' },
    recipe_id: DataTypes.UUID,
    is_checked: { type: DataTypes.BOOLEAN, defaultValue: false },
    checked_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  }, { tableName: 'shopping_list_items' });

  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    household_id: DataTypes.UUID,
    type: { type: DataTypes.ENUM('expiry_alert', 'low_stock', 'recipe_suggestion', 'system', 'household_invite'), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    body: DataTypes.TEXT,
    data: DataTypes.JSONB,
    read_at: DataTypes.DATE,
  }, { tableName: 'notifications' });

  const GeminiKeyword = sequelize.define('GeminiKeyword', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    keyword: { type: DataTypes.STRING(100), allowNull: false },
    category: { type: DataTypes.ENUM('cuisine', 'nutrition', 'diet', 'ingredient', 'health_goal', 'restriction'), allowNull: false },
    weight: { type: DataTypes.DECIMAL(3, 2), defaultValue: 1.0 },
    is_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    metadata: DataTypes.JSONB,
    created_by_admin_id: DataTypes.UUID,
    deleted_at: DataTypes.DATE,
  }, { tableName: 'gemini_keywords' });

  const GeminiPromptTemplate = sequelize.define('GeminiPromptTemplate', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    template_type: { type: DataTypes.ENUM('recipe_recommend', 'recipe_detail', 'chat', 'shopping', 'nutrition'), allowNull: false },
    system_prompt: { type: DataTypes.TEXT, allowNull: false },
    user_prompt_template: { type: DataTypes.TEXT, allowNull: false },
    model: { type: DataTypes.STRING(50), defaultValue: 'gemini-2.0-flash' },
    temperature: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0.7 },
    max_tokens: { type: DataTypes.INTEGER, defaultValue: 2048 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    created_by_admin_id: DataTypes.UUID,
    deleted_at: DataTypes.DATE,
  }, { tableName: 'gemini_prompt_templates' });

  const GeminiUsageLog = sequelize.define('GeminiUsageLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    household_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    template_id: DataTypes.UUID,
    request_type: DataTypes.STRING(50),
    tokens_input: DataTypes.INTEGER,
    tokens_output: DataTypes.INTEGER,
    latency_ms: DataTypes.INTEGER,
    status: { type: DataTypes.ENUM('success', 'error'), defaultValue: 'success' },
    error_message: DataTypes.TEXT,
  }, { tableName: 'gemini_usage_logs', updatedAt: false });

  const AiChatSession = sequelize.define('AiChatSession', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    household_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    title: DataTypes.STRING(255),
  }, { tableName: 'ai_chat_sessions' });

  const AiChatMessage = sequelize.define('AiChatMessage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    session_id: { type: DataTypes.UUID, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  }, { tableName: 'ai_chat_messages', updatedAt: false });

  const NutritionLog = sequelize.define('NutritionLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    household_member_id: { type: DataTypes.UUID, allowNull: false },
    log_date: { type: DataTypes.DATEONLY, allowNull: false },
    calories: DataTypes.INTEGER,
    protein_g: DataTypes.DECIMAL(8, 2),
    carbs_g: DataTypes.DECIMAL(8, 2),
    fats_g: DataTypes.DECIMAL(8, 2),
    micronutrients: DataTypes.JSONB,
    source: { type: DataTypes.ENUM('recipe', 'manual'), defaultValue: 'manual' },
    recipe_id: DataTypes.UUID,
  }, { tableName: 'nutrition_logs' });

  const ActivityLog = sequelize.define('ActivityLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: DataTypes.UUID,
    household_id: DataTypes.UUID,
    action: { type: DataTypes.STRING(100), allowNull: false },
    entity_type: DataTypes.STRING(50),
    entity_id: DataTypes.UUID,
    metadata: DataTypes.JSONB,
    ip_address: DataTypes.INET,
    user_agent: DataTypes.TEXT,
  }, { tableName: 'activity_logs', updatedAt: false });

  // Associations
  User.belongsTo(Role, { foreignKey: 'role_id' });
  AdminUser.belongsTo(Role, { foreignKey: 'role_id' });
  User.hasMany(RefreshToken, { foreignKey: 'user_id' });
  User.hasMany(HouseholdMember, { foreignKey: 'user_id' });

  Household.belongsTo(User, { as: 'owner', foreignKey: 'owner_user_id' });
  Household.hasMany(HouseholdMember, { foreignKey: 'household_id' });
  Household.hasMany(HouseholdInvite, { foreignKey: 'household_id' });
  Household.hasMany(PantryItem, { foreignKey: 'household_id' });
  Household.hasMany(ShoppingListItem, { foreignKey: 'household_id' });
  Household.belongsToMany(CuisineType, { through: 'household_cuisines', foreignKey: 'household_id', otherKey: 'cuisine_type_id' });

  HouseholdMember.belongsTo(Household, { foreignKey: 'household_id' });
  HouseholdMember.belongsTo(User, { foreignKey: 'user_id' });

  PantryCategory.hasMany(GroceryCatalog, { foreignKey: 'category_id' });
  GroceryCatalog.belongsTo(PantryCategory, { as: 'category', foreignKey: 'category_id' });
  GroceryCatalog.hasMany(PantryItem, { foreignKey: 'grocery_catalog_id' });

  PantryItem.belongsTo(Household, { foreignKey: 'household_id' });
  PantryItem.belongsTo(GroceryCatalog, { as: 'grocery', foreignKey: 'grocery_catalog_id' });
  PantryItem.hasMany(InventoryTransaction, { foreignKey: 'pantry_item_id' });

  Recipe.belongsTo(CuisineType, { foreignKey: 'cuisine_type_id' });
  Recipe.hasMany(RecipeIngredient, { foreignKey: 'recipe_id', as: 'ingredients' });
  RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipe_id' });
  RecipeIngredient.belongsTo(GroceryCatalog, { as: 'grocery', foreignKey: 'grocery_catalog_id' });
  Recipe.hasMany(RecipeRecommendation, { foreignKey: 'recipe_id' });

  ShoppingListItem.belongsTo(GroceryCatalog, { as: 'grocery', foreignKey: 'grocery_catalog_id' });

  AiChatSession.hasMany(AiChatMessage, { foreignKey: 'session_id', as: 'messages' });
  AiChatMessage.belongsTo(AiChatSession, { foreignKey: 'session_id' });

  return {
    Role,
    Permission,
    User,
    AdminUser,
    RefreshToken,
    Household,
    HouseholdInvite,
    HouseholdMember,
    CuisineType,
    PantryCategory,
    GroceryCatalog,
    PantryItem,
    InventoryTransaction,
    Recipe,
    RecipeIngredient,
    RecipeRecommendation,
    RecipeRating,
    ShoppingListItem,
    Notification,
    GeminiKeyword,
    GeminiPromptTemplate,
    GeminiUsageLog,
    AiChatSession,
    AiChatMessage,
    NutritionLog,
    ActivityLog,
  };
};
