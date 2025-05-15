use tauri::Position;

#[derive(Debug, Clone,PartialEq)]
pub enum Tokentype{
    Number,
    Operator,
    OpenParen,
    CloseParen,
    EoF
}
#[derive(Debug, Clone)]
pub struct Token {
    pub value: String,
    pub token_type: Tokentype
}

impl Token {
    pub fn new(value: String, token_type:Tokentype) -> Token{
        Token{
            value,
            token_type,
        }
    }
}

pub struct Lexer{
    input: Vec<char>,
    position: usize,
}

impl Lexer {
    pub fn new(input: Vec<char>) -> Lexer{
        Lexer{
            input,
            position: 0,
        }
    }

    pub fn at(&self) -> Option<char> {
        self.input.get(self.position).copied()
    }

    pub fn advance(&mut self) {
        self.position += 1;
    }

    pub fn is_at_end(&self) -> bool {
        self.position >= self.input.len()
    }


    pub fn tokenize(&mut self) -> Vec<Token>{
        let mut tokens: Vec<Token> = Vec::new();

        while !self.is_at_end() {
            if let Some(c) = self.at() {
                match c {
                    '+' | '-' | '*' | '/' => {
                        tokens.push(Token::new(c.to_string(), Tokentype::Operator));
                        self.advance();
                    }
                    '0'..='9' => {
                        let mut num = String::new();
                        while let Some(c) = self.at(){
                            if c.is_ascii_digit() {
                                num.push(c);
                                self.advance();
                            }else {
                                break
                            }
                        }
                        tokens.push(Token::new(num, Tokentype::Number))
                    }
                    '(' => {
                        self.advance();
                        tokens.push(Token::new("(".to_string(), Tokentype::OpenParen))
                    }

                    ')' => {
                        self.advance();
                        tokens.push(Token::new(")".to_string(), Tokentype::CloseParen))
                    }

                    '\n' | ' ' | '\r' | '\t' => {
                        self.advance();
                    }
                    _ => {
                        panic!("Unexpected token");
                    }
                }
            }
        }
        tokens.push(Token::new("EndOfFile".to_string(),Tokentype::EoF));
        tokens
    }
}




